import { Lexer, Token, TokenType } from '../lexer/index.js';
import { 
  ASTNode, 
  ValidationError, 
  ValidationResult, 
  FlowchartNode, 
  FlowchartElement, 
  SequenceNode, 
  ParticipantNode, 
  MessageNode, 
  XYChartNode,
  BlockDiagramNode,
  BlockElement
} from '../ast/index.js';

export class Parser {
  private tokens: Token[];
  private position: number = 0;
  private errors: ValidationError[] = [];
  private linkCount: number = 0;
  private gitgraphBranches: Set<string> = new Set();
  private gitgraphCurrentBranch: string | null = null;
  private gitgraphHasCommits: boolean = false;
  private currentDiagramType: string = 'unknown';
  private implicitParticipants: Set<string> = new Set();

  constructor(input: string) {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
  }

  parse(): ValidationResult {
    this.errors = [];
    this.position = 0;
    this.linkCount = 0;
    this.gitgraphBranches = new Set();
    this.gitgraphCurrentBranch = null;
    this.gitgraphHasCommits = false;
    this.currentDiagramType = 'unknown';
    this.implicitParticipants = new Set();

    try {
      const ast = this.parseDiagram();
      
      // Check for multiple diagram types
      this.validateSingleDiagramType();
      
      return {
        isValid: this.errors.length === 0,
        diagramType: this.getDiagramType(),
        errors: this.errors,
        ast
      };
    } catch (error) {
      this.addError(this.currentToken(), `Parse error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        isValid: false,
        diagramType: 'unknown',
        errors: this.errors
      };
    }
  }

  private parseDiagram(): ASTNode {
    // Skip any directives at the beginning
    while (!this.isAtEnd() && this.currentToken().type === TokenType.DIRECTIVE) {
      this.advance();
    }
    
    const token = this.currentToken();
    const tokenValue = token.value;
    
    // Mermaid CLI is case-sensitive for diagram types
    // Check exact case match
    const isFlowchart = (token.type === TokenType.FLOWCHART && tokenValue === 'flowchart') || 
                        (token.type === TokenType.GRAPH && tokenValue === 'graph');
    const isSequence = token.type === TokenType.SEQUENCE_DIAGRAM && tokenValue === 'sequenceDiagram';
    const isClass = token.type === TokenType.CLASS_DIAGRAM && tokenValue === 'classDiagram';
    const isState = (token.type === TokenType.STATE_DIAGRAM && tokenValue === 'stateDiagram') ||
                    (token.type === TokenType.STATE_DIAGRAM_V2 && tokenValue === 'stateDiagram-v2');
    const isPie = token.type === TokenType.PIE && tokenValue === 'pie';
    const isJourney = token.type === TokenType.JOURNEY && tokenValue === 'journey';
    const isXYChart = token.type === TokenType.XYCHART_BETA && tokenValue === 'xychart-beta';
    // Accept both gitgraph and gitGraph (Mermaid CLI accepts both, but prefers gitGraph)
    const isGitgraph = token.type === TokenType.GITGRAPH && (tokenValue === 'gitGraph' || tokenValue === 'gitgraph');
    const isMindmap = token.type === TokenType.MINDMAP && tokenValue === 'mindmap';
    const isTimeline = token.type === TokenType.TIMELINE && tokenValue === 'timeline';
    const isGantt = token.type === TokenType.GANTT && tokenValue === 'gantt';
    const isER = token.type === TokenType.ER_DIAGRAM && tokenValue === 'erDiagram';
    const isBlock = token.type === TokenType.BLOCK_BETA && tokenValue === 'block-beta';
    
    if (isFlowchart) {
      this.currentDiagramType = 'flowchart';
      return this.parseFlowchart();
    } else if (isSequence) {
      this.currentDiagramType = 'sequence';
      return this.parseSequenceDiagram();
    } else if (isClass) {
      this.currentDiagramType = 'class';
      return this.parseClassDiagram();
    } else if (isState) {
      this.currentDiagramType = 'state';
      return this.parseStateDiagram();
    } else if (isPie) {
      return this.parsePieChart();
    } else if (isJourney) {
      return this.parseJourney();
    } else if (isXYChart) {
      return this.parseXYChart();
    } else if (isGitgraph) {
      return this.parseGitgraph();
    } else if (isMindmap) {
      return this.parseMindmap();
    } else if (isTimeline) {
      return this.parseTimeline();
    } else if (isGantt) {
      return this.parseGantt();
    } else if (isER) {
      return this.parseERDiagram();
    } else if (isBlock) {
      return this.parseBlockDiagram();
      } else if (token.type === TokenType.FLOWCHART || token.type === TokenType.GRAPH || 
                 token.type === TokenType.SEQUENCE_DIAGRAM || token.type === TokenType.CLASS_DIAGRAM ||
                 token.type === TokenType.STATE_DIAGRAM || token.type === TokenType.STATE_DIAGRAM_V2) {
      // Case mismatch - Mermaid CLI is case-sensitive for diagram types
      // Check if the actual value matches the expected case
      const correctCase = this.getCorrectCase(token.type);
      if (token.value !== correctCase) {
        this.addError(
          token,
          `Diagram type "${token.value}" has incorrect case. Mermaid CLI is case-sensitive.`,
          'CASE_SENSITIVE_DIAGRAM_TYPE',
          `Use correct case: "${correctCase}"`
        );
      }
      // Try to parse anyway for error recovery
      if (token.type === TokenType.FLOWCHART || token.type === TokenType.GRAPH) {
        this.currentDiagramType = 'flowchart';
        return this.parseFlowchart();
      } else if (token.type === TokenType.SEQUENCE_DIAGRAM) {
        this.currentDiagramType = 'sequence';
        return this.parseSequenceDiagram();
      } else if (token.type === TokenType.CLASS_DIAGRAM) {
        this.currentDiagramType = 'class';
        return this.parseClassDiagram();
      } else if (token.type === TokenType.STATE_DIAGRAM || token.type === TokenType.STATE_DIAGRAM_V2) {
        this.currentDiagramType = 'state';
        return this.parseStateDiagram();
      }
      // Fallback
      return { type: 'unknown', line: token.line, column: token.column };
    } else {
      this.addError(token, `Unsupported diagram type: ${token.value}`);
      return { type: 'unknown', line: token.line, column: token.column };
    }
  }
  
  private getCorrectCase(tokenType: TokenType): string {
    const cases: Partial<Record<TokenType, string>> = {
      [TokenType.FLOWCHART]: 'flowchart',
      [TokenType.GRAPH]: 'graph',
      [TokenType.SEQUENCE_DIAGRAM]: 'sequenceDiagram',
      [TokenType.CLASS_DIAGRAM]: 'classDiagram',
      [TokenType.STATE_DIAGRAM]: 'stateDiagram',
      [TokenType.STATE_DIAGRAM_V2]: 'stateDiagram-v2',
      [TokenType.PIE]: 'pie',
      [TokenType.JOURNEY]: 'journey',
      [TokenType.XYCHART_BETA]: 'xychart-beta',
      [TokenType.GITGRAPH]: 'gitGraph',
      [TokenType.MINDMAP]: 'mindmap',
      [TokenType.TIMELINE]: 'timeline',
      [TokenType.GANTT]: 'gantt',
      [TokenType.ER_DIAGRAM]: 'erDiagram',
      [TokenType.BLOCK_BETA]: 'block-beta'
    };
    return cases[tokenType] || 'unknown';
  }

  private parseFlowchart(): FlowchartNode {
    const startToken = this.currentToken();
    this.advance(); // Skip graph/flowchart
    this.linkCount = 0; // Reset link count for this flowchart

    // Parse direction (TD, LR, etc.)
    let direction: string | undefined;
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      direction = this.currentToken().value;
      // Validate direction - Mermaid CLI only accepts TD, LR, BT, RL
      const validDirections = ['TD', 'LR', 'BT', 'RL'];
      if (!validDirections.includes(direction.toUpperCase())) {
        this.addError(
          this.currentToken(),
          `Invalid flowchart direction: ${direction}`,
          'INVALID_DIRECTION',
          `Direction must be one of: TD, LR, BT, RL`
        );
      }
      this.advance();
    }

    const nodes: FlowchartElement[] = [];
    
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      // Check if we've encountered another diagram type
      const token = this.currentToken();
      const diagramTypes = [
        TokenType.SEQUENCE_DIAGRAM, TokenType.CLASS_DIAGRAM, TokenType.STATE_DIAGRAM, 
        TokenType.STATE_DIAGRAM_V2, TokenType.ER_DIAGRAM, TokenType.JOURNEY, 
        TokenType.GANTT, TokenType.PIE, TokenType.GITGRAPH, TokenType.MINDMAP, 
        TokenType.TIMELINE, TokenType.XYCHART_BETA
      ];
      
      if (diagramTypes.includes(token.type)) {
        // Allow mixed diagrams - Mermaid CLI supports certain combinations
        // Just stop parsing the flowchart and let the main parser handle the next diagram
        break;
      }
      
      const node = this.parseFlowchartElement();
      if (node) {
        if ((node as any).type === 'processed') {
          // This was a special statement (classDef, etc.) that was already processed
          // Don't add it to nodes and don't advance
        } else {
          nodes.push(node);
        }
      } else {
        // If we can't parse anything, advance to avoid infinite loop
        this.advance();
      }
    }

    // Validate that nodes are properly connected
    this.validateFlowchartConnections(nodes);

    return {
      type: 'flowchart',
      line: startToken.line,
      column: startToken.column,
      direction,
      nodes
    };
  }

  private parseFlowchartElement(): FlowchartElement | null {
    const token = this.currentToken();
    
    // Check for unmatched 'end' keyword (end without corresponding subgraph)
    if (token.type === TokenType.IDENTIFIER && token.value.toLowerCase() === 'end') {
      this.addError(token, 'Unexpected "end" keyword - found end without matching subgraph', 'UNMATCHED_END', 'Remove the end keyword or add a corresponding subgraph');
      this.advance();
      return { type: 'processed', line: token.line, column: token.column } as any;
    }
    
    // Check for special keywords first
    if (token.value === 'classDef') {
      // Parse classDef statements
      this.parseClassDef();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'class') {
      // Parse class assignments
      this.parseClassAssignment();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'linkStyle') {
      // Parse linkStyle statements
      this.parseLinkStyle();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'style') {
      // Parse style statements
      this.parseStyle();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'click') {
      // Parse click statements
      this.parseClickStatement();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'note') {
      // Parse note statements
      this.parseNoteStatement();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'direction') {
      // Parse direction statements
      this.parseDirectionStatement();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'title') {
      // Title directive is not supported in flowcharts - reject it to match Mermaid CLI behavior
      this.addError(token, 
        'Title directive is not supported in flowcharts', 
        'UNSUPPORTED_TITLE_DIRECTIVE', 
        'Remove the title directive - flowcharts do not support titles');
      // Skip the title directive to continue parsing
      this.skipTitleDirective();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.type === TokenType.IDENTIFIER && token.value === '<') {
      // Check if this is a bidirectional arrow: <-->
      const nextToken = this.peekToken();
      if (nextToken && (nextToken.type === TokenType.ARROW || nextToken.type === TokenType.DOTTED_ARROW)) {
        return this.parseBidirectionalArrow();
      }
      // Otherwise treat as regular identifier/node
      return this.parseNode();
    } else if (token.type === TokenType.IDENTIFIER) {
      // Check if this is a node (followed by brackets, parens, or braces)
      const nextToken = this.peekToken();
      if (nextToken && (nextToken.type === TokenType.BRACKET_OPEN || 
                       nextToken.type === TokenType.PAREN_OPEN || 
                       nextToken.type === TokenType.BRACE_OPEN)) {
        return this.parseNode();
      } else {
        // This might be a standalone identifier or part of an arrow
        return this.parseNode();
      }
    } else if (token.type === TokenType.ARROW || token.type === TokenType.DOTTED_ARROW || token.type === TokenType.THICK_ARROW) {
      return this.parseArrow();
    } else if (token.type === TokenType.SUBGRAPH) {
      return this.parseSubgraph();
    } else if (token.type === TokenType.COMMENT) {
      // Check if this is truly an inline comment (has content before it on the same line)
      // Inline comments are not supported by Mermaid CLI for strict compatibility
      if (this.isInlineComment(token)) {
        this.addError(token, 'Inline comments are not supported', 'INLINE_COMMENT_NOT_SUPPORTED', 'Move comment to its own line');
      }
      // Skip comments - they don't need to be parsed as elements
      this.advance();
      return { type: 'processed', line: token.line, column: token.column } as any;    } else if (token.type === TokenType.DIRECTIVE) {
      // Skip directives - they are configuration, not diagram elements
      this.advance();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.type === TokenType.SEMICOLON) {
      // Skip semicolons
      this.advance();
      return null;
    } else if (token.type === TokenType.COLON) {
      // Skip colons (used in classDef statements)
      this.advance();
      return null;
    } else if (token.type === TokenType.COMMA) {
      // Skip commas
      this.advance();
      return null;
    } else if (token.type === TokenType.EQUALS) {
      // Skip equals signs
      this.advance();
      return null;
    } else if (token.type === TokenType.PIPE) {
      // Skip pipes (used in labels)
      this.advance();
      return null;
    } else if (token.type === TokenType.NUMBER) {
      // Skip numbers (used in styling)
      this.advance();
      return null;
    } else if (token.type === TokenType.STRING) {
      // Skip strings (used in styling and labels)
      this.advance();
      return null;
    } else if (token.type === TokenType.BRACKET_OPEN || 
               token.type === TokenType.BRACKET_CLOSE ||
               token.type === TokenType.PAREN_OPEN || 
               token.type === TokenType.PAREN_CLOSE ||
               token.type === TokenType.BRACE_OPEN || 
               token.type === TokenType.BRACE_CLOSE) {
      // Skip brackets, parens, braces (used in styling)
      this.advance();
      return null;
    }
    
    return null;
  }

  private peekToken(offset: number = 1): Token | null {
    if (this.position + offset >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.position + offset];
  }

  private parseNode(): FlowchartElement {
    const idToken = this.currentToken();
    
    // Check if we're at EOF or have an invalid token
    if (idToken.type === TokenType.EOF) {
      this.addError(idToken, 'Expected node identifier', 'MISSING_NODE', 'Add a node identifier');
      return {
        type: 'node',
        line: idToken.line,
        column: idToken.column,
        id: '',
        shape: 'rect'
      };
    }
    
    const id = idToken.value;
    
    // Mermaid CLI rejects emojis and certain unicode characters in node IDs
    // Check for emojis and other problematic characters
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(id)) {
      this.addError(
        idToken,
        `Node ID "${id}" contains emojis or unsupported unicode characters`,
        'INVALID_NODE_ID',
        'Use alphanumeric characters, underscores, and basic punctuation only'
      );
    }
    
    this.advance();

    let label: string | undefined;
    let shape: 'rect' | 'round' | 'diamond' | 'circle' = 'rect';

    // Check if there's a shape/label after the node ID
    if (this.currentToken().type === TokenType.BRACKET_OPEN) {
      this.advance(); // Skip [
      
      // Parse label content - handle multiple identifiers and numbers as a single label
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1); // Remove quotes
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
        label = this.collectIdentifiersAsLabel(true);
      }
      
      // Check if label is empty (Mermaid CLI rejects empty labels)
      if (this.currentToken().type === TokenType.BRACKET_CLOSE && (!label || label.trim() === '')) {
        this.addError(
          this.currentToken(),
          'Empty node labels are not allowed',
          'EMPTY_NODE_LABEL',
          'Add a label inside the brackets or remove the brackets'
        );
      }
      
      // Expect closing bracket
      if (this.currentToken().type === TokenType.BRACKET_CLOSE) {
        this.advance(); // Skip ]
      } else {
        this.addError(this.currentToken(), 'Expected closing bracket ]');
        // Try to recover by skipping to next token
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.BRACKET_CLOSE && 
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.DOTTED_ARROW && this.currentToken().type !== TokenType.EOF) {
          this.advance();
        }
        if (this.currentToken().type === TokenType.BRACKET_CLOSE) {
          this.advance();
        }
      }
    } else if (this.currentToken().type === TokenType.PAREN_OPEN) {
      this.advance(); // Skip (
      shape = 'round';
      
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1);
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER) {
        // Collect multiple identifiers as a single label
        const labelParts: string[] = [];
        while (this.currentToken().type === TokenType.IDENTIFIER) {
          labelParts.push(this.currentToken().value);
          this.advance();
        }
        label = labelParts.join(' ');
      }
      
      if (this.currentToken().type === TokenType.PAREN_CLOSE) {
        this.advance(); // Skip )
      } else {
        this.addError(this.currentToken(), 'Expected closing parenthesis )');
        // Try to recover
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.PAREN_CLOSE && 
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.DOTTED_ARROW && this.currentToken().type !== TokenType.EOF) {
          this.advance();
        }
        if (this.currentToken().type === TokenType.PAREN_CLOSE) {
          this.advance();
        }
      }
    } else if (this.currentToken().type === TokenType.DOUBLE_PAREN_OPEN) {
      this.advance(); // Skip ((
      shape = 'circle'; // Double-circle nodes
      
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1);
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER) {
        // Collect multiple identifiers as a single label
        const labelParts: string[] = [];
        while (this.currentToken().type === TokenType.IDENTIFIER) {
          labelParts.push(this.currentToken().value);
          this.advance();
        }
        label = labelParts.join(' ');
      }
      
      if (this.currentToken().type === TokenType.DOUBLE_PAREN_CLOSE) {
        this.advance(); // Skip ))
      } else {
        this.addError(this.currentToken(), 'Expected closing double parenthesis ))');
        // Try to recover
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.DOUBLE_PAREN_CLOSE && 
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.DOTTED_ARROW && this.currentToken().type !== TokenType.EOF) {
          this.advance();
        }
        if (this.currentToken().type === TokenType.DOUBLE_PAREN_CLOSE) {
          this.advance();
        }
      }
    } else if (this.currentToken().type === TokenType.BRACE_OPEN) {
      this.advance(); // Skip {
      shape = 'diamond';
      
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1);
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER) {
        // Collect multiple identifiers as a single label
        const labelParts: string[] = [];
        while (this.currentToken().type === TokenType.IDENTIFIER) {
          labelParts.push(this.currentToken().value);
          this.advance();
        }
        label = labelParts.join(' ');
      }
      
      if (this.currentToken().type === TokenType.BRACE_CLOSE) {
        this.advance(); // Skip }
      } else {
        this.addError(this.currentToken(), 'Expected closing brace }');
        // Try to recover
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.BRACE_CLOSE && 
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.DOTTED_ARROW && this.currentToken().type !== TokenType.EOF) {
          this.advance();
        }
        if (this.currentToken().type === TokenType.BRACE_CLOSE) {
          this.advance();
        }
      }
    }

    return {
      type: 'node',
      line: idToken.line,
      column: idToken.column,
      id,
      label,
      shape
    };
  }

  private parseBidirectionalArrow(): FlowchartElement {
    const arrowStartToken = this.currentToken();
    this.advance(); // Skip <
    
    // Parse the arrow part (--> or -.-)
    const arrowToken = this.currentToken();
    this.advance(); // Skip arrow
    this.linkCount++; // Count this as a link (bidirectional counts as one link)
    
    // Parse optional label
    let label: string | undefined;
    if (this.currentToken().type === TokenType.PIPE) {
      this.advance(); // Skip |
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1);
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
        const labelParts: string[] = [];
        while (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
          labelParts.push(this.currentToken().value);
          this.advance();
        }
        label = labelParts.join(' ');
      }
      if (this.currentToken().type === TokenType.PIPE) {
        this.advance(); // Skip |
      } else {
        this.addError(this.currentToken(), 'Expected closing pipe |');
      }
    }
    
    // Parse destination node
    if (this.isAtEnd() || this.currentToken().type === TokenType.EOF) {
      this.addError(arrowToken, 'Arrow must have a destination node', 'INCOMPLETE_ARROW', 'Add a node after the arrow');
      return {
        type: 'arrow',
        line: arrowStartToken.line,
        column: arrowStartToken.column,
        label,
        to: undefined
      };
    }
    
    const toNode = this.parseNode();
    
    // Expect trailing < for bidirectional arrow
    if (!this.isAtEnd() && this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value === '<') {
      this.advance(); // Skip the trailing <
    } else {
      // Missing trailing < - but Mermaid CLI is lenient, so we'll accept it
    }
    
    return {
      type: 'arrow',
      line: arrowStartToken.line,
      column: arrowStartToken.column,
      label,
      to: (toNode as any).id || toNode.type
    };
  }

  private parseArrow(): FlowchartElement {
    const arrowToken = this.currentToken();
    this.advance(); // Skip arrow
    this.linkCount++; // Count this as a link

    let label: string | undefined;
    if (this.currentToken().type === TokenType.PIPE) {
      this.advance(); // Skip |
      if (this.currentToken().type === TokenType.STRING) {
        label = this.currentToken().value.slice(1, -1);
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
        // Collect multiple identifiers/numbers as a single label
        const labelParts: string[] = [];
        while (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
          labelParts.push(this.currentToken().value);
          this.advance();
        }
        label = labelParts.join(' ');
      }
      // Expect closing pipe
      if (this.currentToken().type === TokenType.PIPE) {
        this.advance(); // Skip |
      } else {
        this.addError(this.currentToken(), 'Expected closing pipe |');
      }
    }

    // Check if there's a valid destination node
    if (this.isAtEnd() || this.currentToken().type === TokenType.EOF) {
      this.addError(arrowToken, 'Arrow must have a destination node', 'INCOMPLETE_ARROW', 'Add a node after the arrow');
      return {
        type: 'arrow',
        line: arrowToken.line,
        column: arrowToken.column,
        label,
        to: undefined
      };
    }

    const toNode = this.parseNode();

    return {
      type: 'arrow',
      line: arrowToken.line,
      column: arrowToken.column,
      label,
      to: toNode.id
    };
  }

  private parseSequenceDiagram(): SequenceNode {
    const startToken = this.currentToken();
    this.advance(); // Skip sequenceDiagram

    const participants: ParticipantNode[] = [];
    const messages: MessageNode[] = [];
    const controlStack: Array<{type: string, line: number, column: number}> = []; // Track control structures
    this.implicitParticipants = new Set(); // Track participants used in messages but not declared

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.type === TokenType.PARTICIPANT) {
        participants.push(this.parseParticipant());
      } else if (token.type === TokenType.DIRECTIVE) {
        // Skip directives - they are configuration, not diagram elements
        this.advance();
      } else if (token.value === 'Note') {
        // Note is a valid sequence diagram command, not a styling directive
        this.parseSequenceNote();
      } else if (token.value === 'loop' || token.value === 'alt' || token.value === 'opt' || 
                 token.value === 'par' || token.value === 'critical' || token.value === 'break') {
        // Control structure - must have matching end
        controlStack.push({type: token.value, line: token.line, column: token.column});
        this.advance(); // Skip control keyword
        // Skip label if present
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF && 
               this.currentToken().line === token.line && 
               this.currentToken().type !== TokenType.NEWLINE) {
          this.advance();
        }
      } else if (token.value === 'end') {
        if (controlStack.length === 0) {
          this.addError(token, 'Unexpected "end" without matching control structure', 'UNMATCHED_END', 'Remove this "end" or add a matching control structure');
        } else {
          controlStack.pop();
        }
        this.advance();
      } else if (token.value === 'activate') {
        this.advance(); // Skip activate
        // Validate participant exists
        const participantToken = this.currentToken();
        if (participantToken.type === TokenType.IDENTIFIER || participantToken.type === TokenType.STRING) {
          const participantName = participantToken.type === TokenType.STRING 
            ? participantToken.value.slice(1, -1) 
            : participantToken.value;
          const participantExists = participants.some(p => p.name === participantName || p.alias === participantName) ||
                                   this.implicitParticipants.has(participantName);
          // Mermaid CLI allows activate with implicit participants (used in messages but not declared)
          // So we don't add an error here - it's valid
          this.advance();
        } else {
          this.addError(token, 'activate must specify a participant', 'MISSING_PARTICIPANT', 'Add a participant name after activate');
        }
      } else if (token.value === 'deactivate') {
        this.advance(); // Skip deactivate
        if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.STRING) {
          this.advance();
        }
      } else if (token.value === 'classDef' || token.value === 'class' || token.value === 'linkStyle' || 
                 token.value === 'style' || token.value === 'click') {
        // Styling directives are not valid in sequence diagrams
        this.addError(token, 
          `${token.value} directive is not supported in sequence diagrams`, 
          'UNSUPPORTED_STYLING_DIRECTIVE', 
          'Styling directives are not supported in sequence diagrams');
        // Skip the directive to continue parsing
        this.skipUntilSemicolon();
      } else if (token.type === TokenType.IDENTIFIER || token.type === TokenType.STRING) {
        // Check for invalid sequence arrow pattern: A--B (without >)
        // This happens when -- is followed by identifier without >
        if (token.value.includes('--') && !token.value.includes('-->') && !token.value.includes('-->>') && !token.value.includes('--x')) {
          // Check if this looks like A--B pattern (invalid)
          const parts = token.value.split('--');
          if (parts.length === 2 && parts[0] && parts[1]) {
            // This is likely A--B: which is invalid (should be A-->>B:)
            this.addError(
              token,
              'Invalid sequence arrow syntax. Dotted arrows must end with > (use -->> or --x)',
              'INVALID_SEQUENCE_ARROW',
              'Use -->> for dotted arrow or --x for dotted cross arrow'
            );
          }
        }
        // Check if this looks like a message (has an arrow after it)
        const nextToken = this.peekToken();
        if (nextToken && (nextToken.type === TokenType.SEQUENCE_ARROW || nextToken.type === TokenType.ARROW)) {
          // Validate that flowchart arrows (-->) are not used in sequence diagrams
          if (nextToken.type === TokenType.ARROW && nextToken.value === '-->') {
            this.addError(
              nextToken,
              'Flowchart arrow (-->) cannot be used in sequence diagrams. Use sequence arrows (->>, -->>, ->, --)',
              'INVALID_ARROW_TYPE',
              'Use sequence diagram arrows: ->>, -->>, ->, or --'
            );
          }
          messages.push(this.parseMessageLine());
        } else if (nextToken && nextToken.type === TokenType.IDENTIFIER && nextToken.value === '-') {
          // Check for malformed arrow like "A - B" (space-dash-space, not a valid arrow)
          // This is tokenized as IDENTIFIER("A"), IDENTIFIER("-"), IDENTIFIER("B")
          const afterDash = this.peekToken(2);
          if (afterDash && (afterDash.type === TokenType.IDENTIFIER || afterDash.type === TokenType.STRING)) {
            this.addError(
              token,
              'Malformed arrow syntax. Use proper sequence arrows: ->>, -->>, ->, or --',
              'MALFORMED_ARROW',
              'Use sequence diagram arrows: ->>, -->>, ->, or --'
            );
            // Skip A, -, B
            this.advance(); // Skip A
            this.advance(); // Skip -
            this.advance(); // Skip B
          } else {
            this.advance();
          }
        } else {
          // Skip identifiers/strings that aren't part of messages
          this.advance();
        }
      } else {
        // Skip unknown tokens to avoid infinite loop
        this.advance();
      }
    }

    // Validate that participants are defined before messages
    this.validateSequenceDiagram(participants, messages);
    
    // Validate that all control structures have matching ends
    if (controlStack.length > 0) {
      const unclosed = controlStack[controlStack.length - 1];
      this.addError(
        { line: unclosed.line, column: unclosed.column, type: TokenType.IDENTIFIER, value: unclosed.type } as Token,
        `Control structure "${unclosed.type}" is missing matching "end"`,
        'UNCLOSED_CONTROL_STRUCTURE',
        `Add "end" to close the "${unclosed.type}" block`
      );
    }

    return {
      type: 'sequence',
      line: startToken.line,
      column: startToken.column,
      participants,
      messages
    };
  }

  private parseParticipant(): ParticipantNode {
    const startToken = this.currentToken();
    this.advance(); // Skip participant

    // Check if there's a valid participant name (can be IDENTIFIER or STRING)
    const nameToken = this.currentToken();
    if (nameToken.type === TokenType.EOF || this.isAtEnd() || 
        (nameToken.type !== TokenType.IDENTIFIER && nameToken.type !== TokenType.STRING)) {
      this.addError(startToken, 'Participant declaration must have a name', 'MISSING_PARTICIPANT_NAME', 'Add a participant name after the participant keyword');
      return {
        type: 'participant',
        line: startToken.line,
        column: startToken.column,
        name: '',
        alias: undefined
      };
    }

    // Extract the name (remove quotes from STRING tokens)
    const name = nameToken.type === TokenType.STRING 
      ? nameToken.value.slice(1, -1) 
      : nameToken.value;
    this.advance();

    let alias: string | undefined;
    // Check for "as" keyword before looking for alias
    if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value === 'as') {
      this.advance(); // Skip "as"
      if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.STRING) {
        alias = this.currentToken().type === TokenType.STRING
          ? this.currentToken().value.slice(1, -1)
          : this.currentToken().value;
        this.advance();
      }
    }

    return {
      type: 'participant',
      line: startToken.line,
      column: startToken.column,
      name,
      alias
    };
  }

  private parseMessageLine(): MessageNode {
    const fromToken = this.currentToken();
    // Handle both IDENTIFIER and STRING tokens for participant names
    let from = fromToken.type === TokenType.STRING 
      ? fromToken.value.slice(1, -1) 
      : fromToken.value;
    
    // Track implicit participants (used in messages but not declared)
    this.implicitParticipants.add(from);
    
    // Check for invalid pattern like A--B (where -- is part of identifier)
    // This happens when lexer doesn't recognize -- as arrow
    if (from.includes('--') && !from.includes('-->') && !from.includes('-->>') && !from.includes('--x')) {
      const parts = from.split('--');
      if (parts.length === 2 && parts[0] && parts[1]) {
        // This is A--B pattern - invalid sequence arrow
        this.addError(
          fromToken,
          'Invalid sequence arrow syntax. Dotted arrows must end with > (use -->> or --x)',
          'INVALID_SEQUENCE_ARROW',
          'Use -->> for dotted arrow or --x for dotted cross arrow'
        );
        // Extract just the from part
        from = parts[0];
        this.advance(); // Skip the A--B token
        // The rest (B:) will be parsed as destination
      } else {
        this.advance();
      }
    } else {
      this.advance();
    }

    // Parse arrow type
    let arrowType: 'solid' | 'dotted' | 'thick' = 'solid';
    const arrowToken = this.currentToken();
    if (arrowToken.type === TokenType.SEQUENCE_ARROW || arrowToken.type === TokenType.ARROW) {
      const arrowValue = arrowToken.value;
      if (arrowValue === '->>') {
        arrowType = 'solid';
      } else if (arrowValue === '-->>') {
        arrowType = 'dotted';
      } else if (arrowValue === '->') {
        arrowType = 'solid';
      } else if (arrowValue === '-->') {
        arrowType = 'solid';
      }
      this.advance();
    } else if (fromToken.value.includes('--') && !fromToken.value.includes('-->')) {
      // Already handled above, but if we get here, there's no arrow token
      // This means the pattern was invalid
    }

    // Check if there's a valid destination
    const toToken = this.currentToken();
    if (toToken.type === TokenType.EOF || this.isAtEnd()) {
      this.addError(arrowToken, 'Incomplete message: arrow must have a destination participant', 'INCOMPLETE_MESSAGE', 'Add a destination participant after the arrow');
      return {
        type: 'message',
        line: fromToken.line,
        column: fromToken.column,
        from,
        to: '',
        message: '',
        arrowType
      };
    }
    
    // Handle both IDENTIFIER and STRING tokens for participant names
    const to = toToken.type === TokenType.STRING 
      ? toToken.value.slice(1, -1) 
      : toToken.value;
    
    // Track implicit participants (used in messages but not declared)
    this.implicitParticipants.add(to);
    
    this.advance();

    // Skip colon if present
    if (this.currentToken().type === TokenType.COLON) {
      this.advance();
    }

    // Collect the rest of the line as the message
    let message = '';
    const startLine = this.currentToken().line;
    const messageParts: string[] = [];
    
    while (!this.isAtEnd() && this.currentToken().line === startLine && this.currentToken().type !== TokenType.EOF) {
      if (this.currentToken().type === TokenType.STRING) {
        messageParts.push(this.currentToken().value.slice(1, -1));
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
        messageParts.push(this.currentToken().value);
        this.advance();
      } else if (this.currentToken().type === TokenType.WHITESPACE || this.currentToken().type === TokenType.NEWLINE) {
        // Skip whitespace and newlines
        this.advance();
      } else if (this.currentToken().type === TokenType.COMMA || this.currentToken().type === TokenType.COLON) {
        // Include punctuation in the message
        messageParts.push(this.currentToken().value);
        this.advance();
      } else {
        // For other tokens, include them in the message
        messageParts.push(this.currentToken().value);
        this.advance();
      }
    }
    
    message = messageParts.join(' ').trim();

    return {
      type: 'message',
      line: fromToken.line,
      column: fromToken.column,
      from,
      to,
      message,
      arrowType
    };
  }

  private parseMessage(): MessageNode {
    const fromToken = this.currentToken();
    const from = fromToken.value;
    this.advance();

    // Parse arrow type
    let arrowType: 'solid' | 'dotted' | 'thick' = 'solid';
    if (this.currentToken().type === TokenType.SEQUENCE_ARROW || this.currentToken().type === TokenType.ARROW) {
      const arrowValue = this.currentToken().value;
      if (arrowValue === '->>') {
        arrowType = 'solid';
      } else if (arrowValue === '-->>') {
        arrowType = 'dotted';
      } else if (arrowValue === '->') {
        arrowType = 'solid';
      } else if (arrowValue === '-->') {
        arrowType = 'solid';
      }
      this.advance();
    }

    const toToken = this.currentToken();
    const to = toToken.value;
    this.advance();

    // Skip colon if present
    if (this.currentToken().type === TokenType.COLON) {
      this.advance();
    }

    // Collect the rest of the line as the message
    let message = '';
    const startLine = this.currentToken().line;
    const messageParts: string[] = [];
    
    while (!this.isAtEnd() && this.currentToken().line === startLine && this.currentToken().type !== TokenType.EOF) {
      if (this.currentToken().type === TokenType.STRING) {
        messageParts.push(this.currentToken().value.slice(1, -1));
        this.advance();
      } else if (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.NUMBER) {
        messageParts.push(this.currentToken().value);
        this.advance();
      } else if (this.currentToken().type === TokenType.WHITESPACE || this.currentToken().type === TokenType.NEWLINE) {
        // Skip whitespace and newlines
        this.advance();
      } else if (this.currentToken().type === TokenType.COMMA || this.currentToken().type === TokenType.COLON) {
        // Include punctuation in the message
        messageParts.push(this.currentToken().value);
        this.advance();
      } else {
        // For other tokens, include them in the message
        messageParts.push(this.currentToken().value);
        this.advance();
      }
    }
    
    message = messageParts.join(' ').trim();

    return {
      type: 'message',
      line: fromToken.line,
      column: fromToken.column,
      from,
      to,
      message,
      arrowType
    };
  }

  /**
   * Validates if an identifier contains special characters that require quoting
   * @param identifier - The identifier to validate
   * @param context - The parsing context (e.g., 'xychart-axis', 'flowchart-label')
   * @returns true if the identifier is valid, false if it needs quoting
   */
  private isValidIdentifier(identifier: string, context: string): boolean {
    // Characters that require quoting in most contexts
    const specialChars = /['"&<>(){}[\]|\\\/\s]/;
    
    // Different rules for different contexts
    switch (context) {
      case 'xychart-axis':
        // xychart-beta is strict about identifiers - no special characters allowed
        return !specialChars.test(identifier);
      case 'flowchart-label':
        // Flowchart labels are more permissive
        return true; // Flowcharts handle special chars better
      case 'sequence-participant':
        // Sequence participants should be quoted if they have special chars
        return !specialChars.test(identifier);
      default:
        // Default: be conservative and require quoting for special chars
        return !specialChars.test(identifier);
    }
  }

  private parseXYChart(): XYChartNode {
    const startToken = this.currentToken();
    this.advance(); // Skip xychart-beta

    let title: string | undefined;
    const xAxis: string[] = [];
    let yAxis: { label: string; min: number; max: number } | undefined;
    const data: { type: 'bar' | 'line'; values: number[] }[] = [];

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.type === TokenType.DIRECTIVE) {
        // Skip directives - they are configuration, not diagram elements
        this.advance();
      } else if (token.value === 'title') {
        this.advance();
        if (this.currentToken().type === TokenType.STRING) {
          title = this.currentToken().value.slice(1, -1);
          this.advance();
        }
      } else if (token.value === 'x-axis') {
        this.advance();
        if (this.currentToken().type === TokenType.BRACKET_OPEN) {
          this.advance();
          while (this.currentToken().type !== TokenType.BRACKET_CLOSE) {
            if (this.currentToken().type === TokenType.STRING) {
              xAxis.push(this.currentToken().value.slice(1, -1));
            } else if (this.currentToken().type === TokenType.IDENTIFIER) {
              const identifier = this.currentToken().value;
              if (!this.isValidIdentifier(identifier, 'xychart-axis')) {
                this.addError(this.currentToken(), 
                  `Identifier '${identifier}' contains special characters and should be quoted`, 
                  'INVALID_IDENTIFIER', 
                  `Use "${identifier}" instead of ${identifier}`);
              }
              xAxis.push(identifier);
            }
            this.advance();
            if (this.currentToken().type === TokenType.COMMA) {
              this.advance();
            }
          }
          this.advance(); // Skip ]
        } else {
          // x-axis without brackets is invalid syntax
          this.addError(this.currentToken(), 
            'x-axis must be followed by a bracketed list of labels', 
            'INVALID_X_AXIS_SYNTAX', 
            'Use x-axis ["Label1", "Label2", "Label3"] format');
        }
      } else if (token.value === 'y-axis') {
        this.advance();
        if (this.currentToken().type === TokenType.STRING) {
          const label = this.currentToken().value.slice(1, -1);
          this.advance();
          
          // Check for invalid 'min' keyword usage
          if (this.currentToken().value === 'min') {
            this.addError(this.currentToken(), 
              'y-axis syntax does not support "min" keyword', 
              'INVALID_Y_AXIS_SYNTAX', 
              'Use format: y-axis "label" minValue --> maxValue');
            this.advance(); // Skip 'min' to avoid infinite loop
          } else if (this.currentToken().type === TokenType.NUMBER) {
            const min = parseInt(this.currentToken().value);
            this.advance();
            
            if (this.currentToken().value === '-->') {
              this.advance();
              if (this.currentToken().type === TokenType.NUMBER) {
                const max = parseInt(this.currentToken().value);
                yAxis = { label, min, max };
                this.advance();
              }
            }
          }
        }
      } else if (token.value === 'bar' || token.value === 'line') {
        const type = token.value as 'bar' | 'line';
        this.advance();
        
        if (this.currentToken().type === TokenType.BRACKET_OPEN) {
          this.advance();
          const values: number[] = [];
          while (this.currentToken().type !== TokenType.BRACKET_CLOSE) {
            if (this.currentToken().type === TokenType.NUMBER) {
              values.push(parseInt(this.currentToken().value));
            }
            this.advance();
            if (this.currentToken().type === TokenType.COMMA) {
              this.advance();
            }
          }
          data.push({ type, values });
          this.advance(); // Skip ]
        }
      } else if (token.value === 'area' || token.value === 'scatter') {
        // Unsupported chart types - Mermaid CLI doesn't support these yet
        this.addError(token, `Chart type '${token.value}' is not supported by Mermaid CLI`, 'UNSUPPORTED_CHART_TYPE', 'Use bar or line chart types instead');
        this.advance(); // Skip the unsupported token to avoid infinite loop
      } else if (token.value === 'series') {
        // series syntax is not supported by Mermaid CLI
        this.addError(token, `'series' syntax is not supported by Mermaid CLI`, 'UNSUPPORTED_SERIES_SYNTAX', 'Use bar or line directly instead of series "name" type chart');
        this.advance(); // Skip 'series' to avoid infinite loop
      } else {
        // Skip unknown tokens to avoid infinite loop
        this.advance();
      }
    }

    // Validate the chart
    this.validateXYChart(title || '', xAxis, yAxis || { label: '', min: 0, max: 100 }, data);

    return {
      type: 'xychart',
      line: startToken.line,
      column: startToken.column,
      title,
      xAxis,
      yAxis: yAxis || { label: '', min: 0, max: 100 },
      data
    };
  }

  private parseSubgraph(): FlowchartElement {
    const startToken = this.currentToken();
    this.advance(); // Skip subgraph

    const id = this.currentToken().value;
    this.advance();

    // Skip optional label in brackets after the id
    if (this.currentToken().type === TokenType.BRACKET_OPEN) {
      this.advance(); // Skip [
      // Skip the label content (usually a STRING)
      if (this.currentToken().type === TokenType.STRING) {
        this.advance();
      }
      // Skip ]
      if (this.currentToken().type === TokenType.BRACKET_CLOSE) {
        this.advance();
      }
    }

    const children: FlowchartElement[] = [];
    
    while (!this.isAtEnd() && !(this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'end')) {
      const child = this.parseFlowchartElement();
      if (child) {
        children.push(child);
      }
    }

    // Check if we found the required 'end' keyword
    if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'end') {
      this.advance(); // Skip end
    } else {
      // Report error for missing 'end' keyword
      this.addError(this.currentToken(), 'Expected "end" to close subgraph', 'MISSING_SUBGRAPH_END', 'Add "end" keyword to close the subgraph');
    }

    // Validate connections within the subgraph
    this.validateFlowchartConnections(children);

    return {
      type: 'subgraph',
      line: startToken.line,
      column: startToken.column,
      id,
      children
    };
  }

  private getDiagramType(): string {
    if (this.tokens.length === 0) return 'unknown';
    
    // Find the first non-directive token to determine diagram type
    let firstDiagramToken: Token | null = null;
    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].type !== TokenType.DIRECTIVE) {
        firstDiagramToken = this.tokens[i];
        break;
      }
    }
    
    if (!firstDiagramToken) return 'unknown';
    
    switch (firstDiagramToken.type) {
      case TokenType.GRAPH:
      case TokenType.FLOWCHART:
        return 'flowchart';
      case TokenType.SEQUENCE_DIAGRAM:
        return 'sequence';
      case TokenType.CLASS_DIAGRAM:
        return 'class';
      case TokenType.STATE_DIAGRAM:
      case TokenType.STATE_DIAGRAM_V2:
        return 'state';
      case TokenType.ER_DIAGRAM:
        return 'er';
      case TokenType.JOURNEY:
        return 'journey';
      case TokenType.GANTT:
        return 'gantt';
      case TokenType.PIE:
        return 'pie';
      case TokenType.GITGRAPH:
        return 'gitgraph';
      case TokenType.MINDMAP:
        return 'mindmap';
      case TokenType.TIMELINE:
        return 'timeline';
      case TokenType.XYCHART_BETA:
        return 'xychart';
      case TokenType.BLOCK_BETA:
        return 'block';
      default:
        return 'unknown';
    }
  }

  private currentToken(): Token {
    if (this.position >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // Return EOF token
    }
    return this.tokens[this.position];
  }

  private advance(): void {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length || this.currentToken().type === TokenType.EOF;
  }

  private validateFlowchartConnections(nodes: FlowchartElement[]): void {
    // Check for adjacent nodes on the same line without arrows
    // Nodes on separate lines are allowed, but nodes on the same line
    // must be connected with arrows
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      // If we have two consecutive nodes on the same line without an arrow between them, that's an error
      if (currentNode.type === 'node' && nextNode.type === 'node' && currentNode.line === nextNode.line) {
        this.addError(
          { type: TokenType.IDENTIFIER, value: nextNode.id || '', line: nextNode.line, column: nextNode.column, position: 0 },
          `Adjacent nodes '${currentNode.id}' and '${nextNode.id}' on same line without arrow connection`,
          'MISSING_ARROW',
          'Add an arrow (-->) between the nodes or place them on separate lines'
        );
      }
    }
  }

  private validateSequenceDiagram(participants: ParticipantNode[], messages: MessageNode[]): void {
    // In Mermaid sequence diagrams, participants can be implicitly defined
    // when first used in a message, so we don't validate that all participants
    // are explicitly declared. This is intentionally lenient to match Mermaid's behavior.
    
    // Note: We keep this method for future validations if needed
  }

  private validateXYChart(title: string, xAxis: string[], yAxis: any, data: any[]): void {
    // Check that data is provided
    if (data.length === 0) {
      this.addError(
        { type: TokenType.IDENTIFIER, value: 'data', line: 1, column: 1, position: 0 },
        'No data provided for chart',
        'MISSING_DATA',
        'Add bar, line, or other data series to the chart'
      );
    }
  }

  private parseClassDiagram(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip classDiagram

    let hasContent = false;
    let braceDepth = 0;
    let lastBraceOpenToken: Token | null = null;

    // Parse class diagram content
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      // Track brace depth for unclosed class validation
      if (token.type === TokenType.BRACE_OPEN) {
        braceDepth++;
        lastBraceOpenToken = token;
      } else if (token.type === TokenType.BRACE_CLOSE) {
        braceDepth--;
      }
      
      if (token.type === TokenType.DIRECTIVE) {
        // Skip directives - they are configuration, not diagram elements
        this.advance();
      } else if (token.value === 'classDef') {
        // Handle styling directives that are valid in class diagrams
        hasContent = true;
        this.parseClassDef();
      } else if (token.value === 'class') {
        hasContent = true;
        // For class diagrams, just skip the class assignment
        this.advance(); // Skip 'class'
        // Skip class name if present
        if (this.currentToken().type === TokenType.IDENTIFIER) {
          this.advance();
        }
        // Skip class name if present (for "class Animal animalClass" syntax)
        if (this.currentToken().type === TokenType.IDENTIFIER) {
          this.advance();
        }
      } else if (token.value === 'linkStyle') {
        // linkStyle is valid in class diagrams (Mermaid CLI accepts it)
        hasContent = true;
        this.parseLinkStyle();
      } else if (token.value === 'style' || token.value === 'click' || token.value === 'note') {
        // These styling directives are not valid in class diagrams
        this.addError(token, 
          `${token.value} directive is not supported in class diagrams`, 
          'UNSUPPORTED_STYLING_DIRECTIVE', 
          'Only classDef, class, and linkStyle directives are supported in class diagrams');
        // Skip the directive to continue parsing
        this.skipUntilSemicolon();
      } else if (token.type === TokenType.DOUBLE_PAREN_OPEN || token.type === TokenType.DOUBLE_PAREN_CLOSE) {
        // Double-parentheses syntax is not valid in class diagrams
        this.addError(token, 
          'Double-parentheses syntax ((text)) is not supported in class diagrams', 
          'UNSUPPORTED_NODE_SHAPE', 
          'Use standard class syntax instead');
        this.advance();
      } else {
        // Skip other tokens (class definitions, relationships, etc.)
        if (token.type !== TokenType.NEWLINE && token.type !== TokenType.WHITESPACE) {
          hasContent = true;
        }
        this.advance();
      }
    }
    
    // Mermaid CLI requires at least one class definition - empty class diagrams are rejected
    if (!hasContent) {
      this.addError(
        startToken,
        'Class diagram must contain at least one class definition',
        'EMPTY_CLASS_DIAGRAM',
        'Add at least one class definition to the diagram'
      );
    }
    
    // Check for unclosed braces (Mermaid CLI rejects unclosed class definitions)
    if (braceDepth > 0 && lastBraceOpenToken) {
      this.addError(
        lastBraceOpenToken,
        'Unclosed class definition - missing closing brace',
        'UNCLOSED_CLASS',
        'Add a closing brace } to complete the class definition'
      );
    }

    return {
      type: 'class',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseStateDiagram(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip stateDiagram-v2

    let braceDepth = 0;
    let lastBraceOpenToken: Token | null = null;

    // Parse state diagram content
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      // Track brace depth for unclosed state validation
      if (token.type === TokenType.BRACE_OPEN) {
        braceDepth++;
        lastBraceOpenToken = token;
      } else if (token.type === TokenType.BRACE_CLOSE) {
        braceDepth--;
      }
      
      // Check for incomplete transitions (arrow without target state)
      if (token.type === TokenType.ARROW || token.type === TokenType.DOTTED_ARROW || 
          token.type === TokenType.THICK_ARROW) {
        // Look ahead to see if there's a target state after the arrow
        const arrowToken = token;
        this.advance(); // Skip the arrow
        
        // Check if next token is EOF, newline followed by EOF, or not a valid target
        const nextToken = this.currentToken();
        const peekToken = this.peekToken(1);
        if (nextToken.type === TokenType.EOF || 
            (nextToken.type === TokenType.NEWLINE && (!peekToken || peekToken.type === TokenType.EOF)) ||
            (nextToken.type !== TokenType.IDENTIFIER && 
             nextToken.type !== TokenType.BRACKET_OPEN && 
             nextToken.value !== '[*]' && 
             nextToken.value !== '[*')) {
          this.addError(
            arrowToken,
            'Incomplete state transition - missing target state',
            'INCOMPLETE_TRANSITION',
            'Add a target state after the arrow (e.g., State1 --> State2)'
          );
          // Don't advance further, let the loop continue
          continue;
        }
        // Valid transition, continue parsing
        continue;
      }
      
      if (token.type === TokenType.DIRECTIVE) {
        // Skip directives - they are configuration, not diagram elements
        this.advance();
      } else if (token.value === 'classDef') {
        // Handle styling directives that are valid in state diagrams
        this.parseClassDef();
      } else if (token.value === 'class') {
        this.parseClassAssignment();
      } else if (token.value === 'Note') {
        // Note is valid in state diagrams (Mermaid CLI accepts it)
        this.parseStateNote();
      } else if (token.value === 'linkStyle') {
        // linkStyle is valid in state diagrams (Mermaid CLI accepts it)
        this.parseLinkStyle();
      } else if (token.value === 'style' || token.value === 'click') {
        // These styling directives are not valid in state diagrams
        this.addError(token, 
          `${token.value} directive is not supported in state diagrams`, 
          'UNSUPPORTED_STYLING_DIRECTIVE', 
          'Only classDef, class, Note, and linkStyle directives are supported in state diagrams');
        // Skip the directive to continue parsing
        this.skipUntilSemicolon();
      } else {
        // Skip other tokens (states, transitions, etc.)
        this.advance();
      }
    }
    
    // Check for unclosed braces (Mermaid CLI rejects unclosed state definitions)
    if (braceDepth > 0 && lastBraceOpenToken) {
      this.addError(
        lastBraceOpenToken,
        'Unclosed state definition - missing closing brace',
        'UNCLOSED_STATE',
        'Add a closing brace } to complete the state definition'
      );
    }

    return {
      type: 'state',
      line: startToken.line,
      column: startToken.column
    };
  }
  
  private parseStateNote(): void {
    // Similar to sequence note parsing
    const noteToken = this.currentToken();
    this.advance(); // Skip 'Note'
    
    // Parse Note syntax: Note right of State1: text
    // Skip position keywords (right, left, over)
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      const position = this.currentToken().value.toLowerCase();
      if (position === 'right' || position === 'left' || position === 'over') {
        this.advance(); // Skip position
        // Skip 'of' if present (for right/left)
        if (position === 'right' || position === 'left') {
          if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'of') {
            this.advance(); // Skip 'of'
          }
        }
      }
    }
    
    // Skip state names (can be multiple for 'over')
    while (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.STRING) {
      this.advance();
      // Skip comma if present
      if (this.currentToken().type === TokenType.COMMA) {
        this.advance();
      } else {
        break;
      }
    }
    
    // Skip colon
    if (this.currentToken().type === TokenType.COLON) {
      this.advance();
    }
    
    // Skip the note text (rest of line)
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF && 
           this.currentToken().line === noteToken.line) {
      this.advance();
    }
  }

  private skipUntilSemicolon(): void {
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parsePieChart(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip pie

    // For now, just parse until end - full pie chart parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'pie',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseJourney(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip journey

    // For now, just parse until end - full journey parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'journey',
      line: startToken.line,
      column: startToken.column
    };
  }

  private collectIdentifiersAsLabel(includeNumbers: boolean = false): string {
    // Collect multiple identifiers (and optionally numbers) as a single label
    const parts: string[] = [];
    while ((this.currentToken().type === TokenType.IDENTIFIER || 
           (includeNumbers && this.currentToken().type === TokenType.NUMBER)) && 
           !this.isAtEnd()) {
      parts.push(this.currentToken().value);
      this.advance();
    }
    return parts.join(' ');
  }

  private collectIdentifiersOnSameLine(): string {
    // Collect multiple identifiers as a single text, but only on the same line
    const parts: string[] = [];
    const startLine = this.currentToken().line;
    while (this.currentToken().type === TokenType.IDENTIFIER && 
           this.currentToken().line === startLine && 
           !this.isAtEnd()) {
      parts.push(this.currentToken().value);
      this.advance();
    }
    return parts.join(' ');
  }


  private isInlineComment(commentToken: Token): boolean {
    // An inline comment is one that has non-whitespace content before it on the same line
    // Look backwards through tokens on the same line to see if there are any non-comment tokens
    const currentLine = commentToken.line;
    
    // Find the position of this comment token in the tokens array
    let commentIndex = -1;
    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i] === commentToken) {
        commentIndex = i;
        break;
      }
    }
    
    if (commentIndex === -1) return false;
    
    // Look backwards from the comment token to find other tokens on the same line
    for (let i = commentIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (token.line < currentLine) {
        // We've moved to a previous line, so this comment is standalone
        break;
      }
      if (token.line === currentLine && token.type !== TokenType.WHITESPACE && token.type !== TokenType.NEWLINE) {
        // Found a non-whitespace token on the same line before the comment
        return true;
      }
    }
    
    return false;
  }  private parseClassDef(): void {
    const classDefToken = this.currentToken();
    
    // Skip 'classDef'
    this.advance();
    
    // Check for equals syntax in CSS properties (not supported in Mermaid CLI v11.12.0)
    let hasEqualsSyntax = false;
    let currentPos = this.position;
    
    // Look ahead to check for equals signs in the CSS properties
    while (currentPos < this.tokens.length && 
           this.tokens[currentPos].type !== TokenType.SEMICOLON && 
           this.tokens[currentPos].type !== TokenType.EOF) {
      if (this.tokens[currentPos].value === '=') {
        hasEqualsSyntax = true;
        break;
      }
      currentPos++;
    }
    
    if (hasEqualsSyntax) {
      this.addError(classDefToken, 
        'classDef with equals syntax is not supported in flowcharts', 
        'UNSUPPORTED_CLASSDEF_EQUALS_SYNTAX', 
        'Use colon syntax instead (e.g., fill:#f9f instead of fill=lightblue)');
    }
    
    // Skip everything until semicolon (including class name and all styling properties)
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }
  private parseClassAssignment(): void {
    // Skip 'class'
    this.advance();
    
    // Skip class name
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      this.advance();
    }
    
    // If there's a class name after the first identifier, skip it too (for "class Animal animalClass" syntax)
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      this.advance();
    }
    
    // Skip everything until semicolon or EOF
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && 
           this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseLinkStyle(): void {
    const linkStyleToken = this.currentToken();
    
    // Skip 'linkStyle'
    this.advance();
    
    // Extract the link index if it's a number
    // Handle negative numbers: check for IDENTIFIER("-") followed by NUMBER
    let linkIndex: number | null = null;
    let isNegative = false;
    
    if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value === '-') {
      isNegative = true;
      this.advance();
    }
    
    if (this.currentToken().type === TokenType.NUMBER) {
      linkIndex = parseInt(this.currentToken().value);
      if (isNegative) {
        linkIndex = -linkIndex;
      }
      this.advance();
      
      // Validate that the link index exists and is not negative
      // Mermaid CLI rejects negative indices
      if (linkIndex < 0) {
        this.addError(linkStyleToken, 
          `linkStyle index ${linkIndex} is invalid (negative indices are not allowed)`, 
          'INVALID_LINKSTYLE_INDEX', 
          'Use a non-negative link index');
      } else if (linkIndex >= this.linkCount) {
        // For class and state diagrams, Mermaid CLI is lenient - accepts linkStyle even when linkCount is 0
        // Only validate bounds for flowcharts
        if (this.currentDiagramType === 'flowchart') {
          this.addError(linkStyleToken, 
            `linkStyle index ${linkIndex} is out of bounds (only ${this.linkCount} link(s) defined)`, 
            'INVALID_LINKSTYLE_INDEX', 
            `Use a link index between 0 and ${Math.max(0, this.linkCount - 1)}`);
        }
        // For class/state diagrams, silently accept (Mermaid CLI behavior)
      }
    }
    
    // Skip everything until semicolon (including all styling properties)
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseStyle(): void {
    // Skip 'style'
    this.advance();
    
    // Skip everything until semicolon (including node identifier and all styling properties)
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseClickStatement(): void {
    // Skip 'click'
    this.advance();
    
    // Skip everything until end of line or semicolon
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseSequenceNote(): void {
    const noteToken = this.currentToken();
    this.advance(); // Skip 'Note'
    
    // Parse Note syntax: Note right of A: text
    // or: Note left of A: text
    // or: Note over A: text
    // or: Note over A,B: text
    
    // Skip position keywords (right, left, over)
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      const position = this.currentToken().value.toLowerCase();
      if (position === 'right' || position === 'left' || position === 'over') {
        this.advance(); // Skip position
        // Skip 'of' if present (for right/left) - Mermaid CLI requires 'of' for right/left
        if (position === 'right' || position === 'left') {
          if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'of') {
            this.advance(); // Skip 'of'
          } else {
            // Missing 'of' - Mermaid CLI requires it
            this.addError(
              this.currentToken(),
              `Note ${position} requires "of" keyword`,
              'INVALID_NOTE_SYNTAX',
              `Use "Note ${position} of <participant>:" instead`
            );
          }
        }
      } else {
        // Invalid Note syntax - must have right/left/over
        this.addError(
          this.currentToken(),
          'Invalid Note syntax. Must use "right of", "left of", or "over"',
          'INVALID_NOTE_SYNTAX',
          'Use "Note right of <participant>:", "Note left of <participant>:", or "Note over <participant>:"'
        );
      }
    } else {
      // Missing position keyword
      this.addError(
        this.currentToken(),
        'Note must specify position: "right of", "left of", or "over"',
        'INVALID_NOTE_SYNTAX',
        'Use "Note right of <participant>:", "Note left of <participant>:", or "Note over <participant>:"'
      );
    }
    
    // Skip participant names (can be multiple for 'over')
    while (this.currentToken().type === TokenType.IDENTIFIER || this.currentToken().type === TokenType.STRING) {
      this.advance();
      // Skip comma if present
      if (this.currentToken().type === TokenType.COMMA) {
        this.advance();
      } else {
        break;
      }
    }
    
    // Skip colon
    if (this.currentToken().type === TokenType.COLON) {
      this.advance();
    }
    
    // Skip the note text (rest of line)
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF && 
           this.currentToken().line === noteToken.line) {
      this.advance();
    }
  }

  private parseNoteStatement(): void {
    // Skip 'note'
    this.advance();
    
    // Check if this is a standalone note statement (which is invalid)
    // Valid note syntax should be: note for A: text or note A: text
    // But Mermaid CLI doesn't actually support standalone note statements
    // So we should reject them to match CLI behavior
    
    // Look ahead to see if this is a standalone note
    const nextToken = this.peekToken();
    if (nextToken && (nextToken.value === 'for' || nextToken.type === TokenType.IDENTIFIER)) {
      // This looks like a standalone note statement - reject it
      this.addError(this.currentToken(), 
        'Standalone note statements are not supported in flowcharts', 
        'INVALID_NOTE_SYNTAX', 
        'Use note arrows instead: A -.->|note text| B');
      return;
    }
    
    // Skip everything until end of line or semicolon
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseDirectionStatement(): void {
    // Skip 'direction'
    this.advance();
    
    // Skip the direction value (e.g., 'TB', 'LR', etc.)
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      this.advance();
    }
  }

  private skipTitleDirective(): void {
    // Skip 'title'
    this.advance();
    
    // Skip the title string if present
    if (this.currentToken().type === TokenType.STRING) {
      this.advance();
    }
    
    // Skip everything until end of line or semicolon
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.SEMICOLON && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }
    
    // Skip semicolon if present
    if (this.currentToken().type === TokenType.SEMICOLON) {
      this.advance();
    }
  }

  private parseGitgraph(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip gitgraph

    // Don't initialize main yet - it only exists implicitly if commits happen before branch commands

    // Parse gitgraph commands
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      // Check if we've encountered another diagram type
      const diagramTypes = [
        TokenType.SEQUENCE_DIAGRAM, TokenType.CLASS_DIAGRAM, TokenType.STATE_DIAGRAM, 
        TokenType.STATE_DIAGRAM_V2, TokenType.ER_DIAGRAM, TokenType.JOURNEY, 
        TokenType.GANTT, TokenType.PIE, TokenType.GITGRAPH, TokenType.MINDMAP, 
        TokenType.TIMELINE, TokenType.XYCHART_BETA
      ];
      
      if (diagramTypes.includes(token.type)) {
        break;
      }

      // Skip comments
      if (token.type === TokenType.COMMENT) {
        this.advance();
        continue;
      }

      // Skip directives
      if (token.type === TokenType.DIRECTIVE) {
        this.advance();
        continue;
      }

      // Skip whitespace and newlines
      if (token.type === TokenType.WHITESPACE || token.type === TokenType.NEWLINE) {
        this.advance();
        continue;
      }

      // Parse gitgraph commands
      if (token.type === TokenType.IDENTIFIER) {
        const command = token.value.toLowerCase();
        
        if (command === 'commit') {
          this.parseGitgraphCommit();
        } else if (command === 'branch') {
          this.parseGitgraphBranch();
        } else if (command === 'checkout') {
          this.parseGitgraphCheckout();
        } else if (command === 'merge') {
          this.parseGitgraphMerge();
        } else {
          // Unknown command - might be part of commit/branch parameters
          // Just advance and continue
          this.advance();
        }
      } else {
        // Unknown token - advance to avoid infinite loop
        this.advance();
      }
    }

    return {
      type: 'gitgraph',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseGitgraphCommit(): void {
    const token = this.currentToken();
    this.advance(); // Skip 'commit'

    // Mark that we've seen commits
    this.gitgraphHasCommits = true;
    
    // If we haven't created any branches yet, we're on the implicit default branch (main)
    if (this.gitgraphBranches.size === 0) {
      this.gitgraphBranches.add('main');
      this.gitgraphCurrentBranch = 'main';
    }

    // Parse optional commit parameters: id, tag, type, etc.
    // Stop when we hit the next command (branch, checkout, merge, commit) or EOF
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const current = this.currentToken();
      
      // Stop if we hit another command keyword
      if (current.type === TokenType.IDENTIFIER) {
        const nextCommand = current.value.toLowerCase();
        if (nextCommand === 'branch' || nextCommand === 'checkout' || 
            nextCommand === 'merge' || nextCommand === 'commit') {
          break; // Don't consume - let the main loop handle it
        }
      }
      
      // Parse id: "value" or tag: "value" etc.
      if (current.type === TokenType.IDENTIFIER) {
        const paramName = current.value.toLowerCase();
        this.advance();
        
        // Check for colon
        if (this.currentToken().type === TokenType.COLON) {
          this.advance();
          // Skip the value (string, identifier, etc.)
          while (!this.isAtEnd() && 
                 this.currentToken().type !== TokenType.EOF &&
                 this.currentToken().type !== TokenType.IDENTIFIER &&
                 this.currentToken().type !== TokenType.COLON) {
            this.advance();
          }
        }
      } else {
        this.advance();
      }
    }
  }

  private parseGitgraphBranch(): void {
    const token = this.currentToken();
    this.advance(); // Skip 'branch'

    // Get branch name - Mermaid CLI is lenient, accepts missing names and names with spaces
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      // Collect branch name - may include spaces (Mermaid CLI accepts this)
      let branchName = this.currentToken().value;
      this.advance(); // Skip first identifier
      
      // Collect additional identifiers/spaces as part of branch name
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
          // Continue collecting as part of branch name
          branchName += ' ' + current.value;
          this.advance();
        } else if (current.type === TokenType.WHITESPACE) {
          // Include whitespace in branch name
          branchName += ' ';
          this.advance();
        } else {
          break;
        }
      }
      
      // Check if branch already exists
      // If commits have happened and we're trying to create "main", it already exists implicitly
      const branchExists = this.gitgraphBranches.has(branchName) || 
                          (branchName === 'main' && this.gitgraphHasCommits);
      
      if (branchExists) {
        this.addError(
          token,
          `Trying to create an existing branch. (Help: Either use a new name if you want create a new branch or try using "checkout ${branchName}")`,
          'DUPLICATE_BRANCH',
          `Branch "${branchName}" already exists. Use "checkout ${branchName}" to switch to it instead.`
        );
      } else {
        // Create new branch
        this.gitgraphBranches.add(branchName);
        this.gitgraphCurrentBranch = branchName;
      }
      
      // Parse optional branch parameters, but stop at next command
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
        }
        this.advance();
      }
    } else {
      // Mermaid CLI is lenient - accepts branch without name, just skip it
      // No error needed
    }
  }

  private parseGitgraphCheckout(): void {
    const token = this.currentToken();
    this.advance(); // Skip 'checkout'

    // Get branch name - Mermaid CLI is lenient, accepts missing names
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      // Collect branch name - may include spaces (Mermaid CLI accepts this)
      let branchName = this.currentToken().value;
      this.advance(); // Skip first identifier
      
      // Collect additional identifiers/spaces as part of branch name
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
          // Continue collecting as part of branch name
          branchName += ' ' + current.value;
          this.advance();
        } else if (current.type === TokenType.WHITESPACE) {
          // Include whitespace in branch name
          branchName += ' ';
          this.advance();
        } else {
          break;
        }
      }
      
      // Check if branch exists (including implicit main if commits happened)
      // Mermaid CLI allows checkout main before any commits (it's lenient)
      const branchExists = this.gitgraphBranches.has(branchName) || 
                          (branchName === 'main' && this.gitgraphHasCommits);
      
      // Mermaid CLI is lenient: allows checkout main before commits
      // But does NOT allow checkout of other branches before they exist
      if (!branchExists && branchName !== 'main') {
        // Mermaid CLI does NOT allow checkout to create a branch (except main before commits)
        // You must use "branch" command first
        this.addError(
          token,
          `Trying to checkout branch which is not yet created. (Help try using "branch ${branchName}")`,
          'CHECKOUT_NONEXISTENT_BRANCH',
          `Branch "${branchName}" must be created with "branch" command before it can be checked out`
        );
      } else if (branchName === 'main' && !this.gitgraphBranches.has('main')) {
        // Explicitly add main to the set if it exists implicitly (either from commits or early checkout)
        this.gitgraphBranches.add('main');
      }
      
      this.gitgraphCurrentBranch = branchName;
      
      // Parse optional checkout parameters, but stop at next command
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
        }
        this.advance();
      }
    } else {
      // Mermaid CLI is lenient - accepts checkout without name, just skip it
      // No error needed
    }
  }

  private parseGitgraphMerge(): void {
    const token = this.currentToken();
    this.advance(); // Skip 'merge'

    // Get branch name to merge - Mermaid CLI is lenient, accepts missing names
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      // Collect branch name - may include spaces (Mermaid CLI accepts this)
      // But stop at colons (which indicate parameters like tag:)
      let branchName = this.currentToken().value;
      this.advance(); // Skip first identifier
      
      // Collect additional identifiers/spaces as part of branch name
      // Stop at colons (parameters) or command keywords
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        if (current.type === TokenType.COLON) {
          // Colon indicates a parameter (like tag:), stop collecting branch name
          break;
        } else if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
          // Check if this identifier is followed by a colon (parameter name)
          const peek = this.peekToken();
          if (peek && peek.type === TokenType.COLON) {
            // This is a parameter name (like "tag:"), stop collecting branch name
            break;
          }
          // Continue collecting as part of branch name
          branchName += ' ' + current.value;
          this.advance();
        } else if (current.type === TokenType.WHITESPACE) {
          // Include whitespace in branch name
          branchName += ' ';
          this.advance();
        } else {
          break;
        }
      }
      
      // Check if branch exists (including implicit main if commits happened)
      const branchExists = this.gitgraphBranches.has(branchName) || 
                          (branchName === 'main' && this.gitgraphHasCommits);
      
      if (!branchExists) {
        this.addError(
          token,
          `Cannot merge branch "${branchName}" - branch does not exist`,
          'MERGE_NONEXISTENT_BRANCH',
          `Branch "${branchName}" must be created before it can be merged`
        );
      }
      
      // Parse optional merge parameters (tag, etc.), but stop at next command
      while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
        const current = this.currentToken();
        
        if (current.type === TokenType.IDENTIFIER) {
          const nextCommand = current.value.toLowerCase();
          if (nextCommand === 'branch' || nextCommand === 'checkout' || 
              nextCommand === 'merge' || nextCommand === 'commit') {
            break;
          }
          
          const paramName = current.value.toLowerCase();
          this.advance();
          
          if (this.currentToken().type === TokenType.COLON) {
            this.advance();
            // Skip the value
            while (!this.isAtEnd() && 
                   this.currentToken().type !== TokenType.EOF &&
                   this.currentToken().type !== TokenType.IDENTIFIER &&
                   this.currentToken().type !== TokenType.COLON) {
              this.advance();
            }
          }
        } else {
          this.advance();
        }
      }
    } else {
      // Mermaid CLI is lenient - accepts merge without name, just skip it
      // No error needed
    }
  }

  private parseMindmap(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip mindmap

    let hasContent = false;

    // Parse mindmap content
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      if (token.type !== TokenType.NEWLINE && token.type !== TokenType.WHITESPACE) {
        hasContent = true;
      }
      this.advance();
    }
    
    // Mermaid CLI requires at least some content - empty mindmaps are rejected
    if (!hasContent) {
      this.addError(
        startToken,
        'Mindmap diagram must contain at least one node',
        'EMPTY_MINDMAP',
        'Add at least one node to the mindmap'
      );
    }

    return {
      type: 'mindmap',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseTimeline(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip timeline

    // For now, just parse until end - full timeline parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'timeline',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseGantt(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip gantt

    // For now, just parse until end - full gantt parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'gantt',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseERDiagram(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip erDiagram

    // For now, just parse until end - full ER diagram parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'er',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseBlockDiagram(): BlockDiagramNode {
    const startToken = this.currentToken();
    this.advance(); // Skip block-beta

    let columns: number | undefined;
    const blocks: BlockElement[] = [];
    let hasContent = false;

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.value === 'columns') {
        hasContent = true;
        this.advance();
        if (this.currentToken().type === TokenType.NUMBER) {
          columns = parseInt(this.currentToken().value);
          this.advance();
        }
      } else if (token.type === TokenType.IDENTIFIER) {
        hasContent = true;
        // Parse block: A["Block A"]
        const id = token.value;
        this.advance();
        
        if (this.currentToken().type === TokenType.BRACKET_OPEN) {
          this.advance();
          let label = '';
          
          if (this.currentToken().type === TokenType.STRING) {
            label = this.currentToken().value.slice(1, -1);
            this.advance();
          } else if (this.currentToken().type === TokenType.IDENTIFIER) {
            label = this.currentToken().value;
            this.advance();
          }
          
          if (this.currentToken().type === TokenType.BRACKET_CLOSE) {
            this.advance();
          }
          
          blocks.push({
            type: 'block',
            line: token.line,
            column: token.column,
            id,
            label
          });
        }
      } else {
        // Skip unknown tokens to avoid infinite loop
        this.advance();
      }
    }

    // Mermaid CLI requires at least some content (blocks or columns) - empty block diagrams are rejected
    if (!hasContent) {
      this.addError(
        startToken,
        'Block diagram must contain at least one block',
        'EMPTY_BLOCK_DIAGRAM',
        'Add at least one block to the diagram'
      );
    }

    return {
      type: 'block',
      line: startToken.line,
      column: startToken.column,
      columns,
      blocks
    };
  }

  private validateSingleDiagramType(): void {
    // Mermaid CLI rejects multiple diagram declarations
    // Check if there are multiple diagram type declarations
    // Only check for diagram types at the start of lines (after directives/comments)
    const diagramTypes: Array<{type: string, line: number, column: number}> = [];
    
    // Find the first non-directive, non-comment token to determine the first diagram type
    let firstDiagramIndex = -1;
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (token.type !== TokenType.DIRECTIVE && token.type !== TokenType.COMMENT && 
          token.type !== TokenType.WHITESPACE && token.type !== TokenType.NEWLINE) {
        firstDiagramIndex = i;
        break;
      }
    }
    
    if (firstDiagramIndex === -1) return;
    
    // Scan tokens for diagram type declarations, but only at line starts
    for (let i = firstDiagramIndex; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      const diagramTypeTokens = [
        TokenType.FLOWCHART, TokenType.GRAPH, TokenType.SEQUENCE_DIAGRAM,
        TokenType.CLASS_DIAGRAM, TokenType.STATE_DIAGRAM, TokenType.STATE_DIAGRAM_V2,
        TokenType.PIE, TokenType.JOURNEY, TokenType.XYCHART_BETA, TokenType.GITGRAPH,
        TokenType.MINDMAP, TokenType.TIMELINE, TokenType.GANTT, TokenType.ER_DIAGRAM,
        TokenType.BLOCK_BETA
      ];
      
      if (diagramTypeTokens.includes(token.type)) {
        // Check if this is at the start of a line (previous token was newline or we're at start)
        const prevToken = i > 0 ? this.tokens[i - 1] : null;
        const isAtLineStart = !prevToken || 
                              prevToken.type === TokenType.NEWLINE || 
                              prevToken.line < token.line ||
                              (prevToken.type === TokenType.WHITESPACE && 
                               (i === 1 || this.tokens[i - 2].type === TokenType.NEWLINE || this.tokens[i - 2].line < token.line));
        
        // Also check it's not inside content (should be followed by identifier for direction, or newline)
        const nextToken = i + 1 < this.tokens.length ? this.tokens[i + 1] : null;
        const looksLikeDeclaration = !nextToken || 
                                     nextToken.type === TokenType.NEWLINE ||
                                     nextToken.type === TokenType.WHITESPACE ||
                                     nextToken.type === TokenType.IDENTIFIER ||
                                     nextToken.line > token.line;
        
        if (isAtLineStart && looksLikeDeclaration) {
          diagramTypes.push({
            type: token.value,
            line: token.line,
            column: token.column
          });
        }
      }
    }
    
    // If we found multiple diagram types, reject it
    // Exception: Mermaid CLI accepts "flowchart" followed by "sequenceDiagram" but rejects other combinations
    if (diagramTypes.length > 1) {
      const firstType = diagramTypes[0].type.toLowerCase();
      const secondType = diagramTypes[1].type.toLowerCase();
      
      // Allow flowchart/graph followed by sequenceDiagram (Mermaid CLI accepts this)
      const isFlowchartFirst = (firstType === 'flowchart' || firstType === 'graph');
      const isSequenceSecond = secondType === 'sequencediagram';
      
      if (!(isFlowchartFirst && isSequenceSecond)) {
        // Reject all other combinations
        const secondDiagram = diagramTypes[1];
        this.addError(
          { line: secondDiagram.line, column: secondDiagram.column, type: TokenType.IDENTIFIER, value: secondDiagram.type, position: 0 } as Token,
          `Multiple diagram declarations are not allowed. Found "${diagramTypes[0].type}" and "${secondDiagram.type}"`,
          'MULTIPLE_DIAGRAM_TYPES',
          'Use only one diagram type per input'
        );
      }
    }
  }

  private addError(token: Token, message: string, code: string = 'PARSE_ERROR', suggestion?: string): void {
    this.errors.push({
      line: token.line,
      column: token.column,
      message,
      code,
      suggestion
    });
  }
}
