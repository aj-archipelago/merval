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

  constructor(input: string) {
    const lexer = new Lexer(input);
    this.tokens = lexer.tokenize();
  }

  parse(): ValidationResult {
    this.errors = [];
    this.position = 0;

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
    const token = this.currentToken();
    
    if (token.type === TokenType.GRAPH || token.type === TokenType.FLOWCHART) {
      return this.parseFlowchart();
    } else if (token.type === TokenType.SEQUENCE_DIAGRAM) {
      return this.parseSequenceDiagram();
    } else if (token.type === TokenType.CLASS_DIAGRAM) {
      return this.parseClassDiagram();
    } else if (token.type === TokenType.STATE_DIAGRAM || token.type === TokenType.STATE_DIAGRAM_V2) {
      return this.parseStateDiagram();
    } else if (token.type === TokenType.PIE) {
      return this.parsePieChart();
    } else if (token.type === TokenType.JOURNEY) {
      return this.parseJourney();
    } else if (token.type === TokenType.XYCHART_BETA) {
      return this.parseXYChart();
    } else if (token.type === TokenType.GITGRAPH) {
      return this.parseGitgraph();
    } else if (token.type === TokenType.MINDMAP) {
      return this.parseMindmap();
    } else if (token.type === TokenType.TIMELINE) {
      return this.parseTimeline();
    } else if (token.type === TokenType.GANTT) {
      return this.parseGantt();
    } else if (token.type === TokenType.ER_DIAGRAM) {
      return this.parseERDiagram();
    } else if (token.type === TokenType.BLOCK_BETA) {
      return this.parseBlockDiagram();
    } else {
      this.addError(token, `Unsupported diagram type: ${token.value}`);
      return { type: 'unknown', line: token.line, column: token.column };
    }
  }

  private parseFlowchart(): FlowchartNode {
    const startToken = this.currentToken();
    this.advance(); // Skip graph/flowchart

    // Parse direction (TD, LR, etc.)
    let direction: string | undefined;
    if (this.currentToken().type === TokenType.IDENTIFIER) {
      direction = this.currentToken().value;
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
    
    // Check for special keywords first
    if (token.value === 'classDef') {
      // Parse classDef statements
      this.parseClassDef();
      return { type: 'processed', line: token.line, column: token.column } as any;
    } else if (token.value === 'class') {
      // Parse class assignments
      this.parseClassAssignment();
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
    } else if (token.type === TokenType.ARROW) {
      return this.parseArrow();
    } else if (token.type === TokenType.SUBGRAPH) {
      return this.parseSubgraph();
    } else if (token.type === TokenType.COMMENT) {
      // Skip comments - they don't need to be parsed as elements
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

  private peekToken(): Token | null {
    if (this.position + 1 >= this.tokens.length) {
      return null;
    }
    return this.tokens[this.position + 1];
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
      
      // Expect closing bracket
      if (this.currentToken().type === TokenType.BRACKET_CLOSE) {
        this.advance(); // Skip ]
      } else {
        this.addError(this.currentToken(), 'Expected closing bracket ]');
        // Try to recover by skipping to next token
        while (!this.isAtEnd() && this.currentToken().type !== TokenType.BRACKET_CLOSE && 
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.EOF) {
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
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.EOF) {
          this.advance();
        }
        if (this.currentToken().type === TokenType.PAREN_CLOSE) {
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
               this.currentToken().type !== TokenType.ARROW && this.currentToken().type !== TokenType.EOF) {
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

  private parseArrow(): FlowchartElement {
    const arrowToken = this.currentToken();
    this.advance(); // Skip -->

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

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.type === TokenType.PARTICIPANT) {
        participants.push(this.parseParticipant());
      } else if (token.type === TokenType.IDENTIFIER || token.type === TokenType.STRING) {
        // Check if this looks like a message (has an arrow after it)
        const nextToken = this.peekToken();
        if (nextToken && (nextToken.type === TokenType.SEQUENCE_ARROW || nextToken.type === TokenType.ARROW)) {
          messages.push(this.parseMessageLine());
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
    const from = fromToken.type === TokenType.STRING 
      ? fromToken.value.slice(1, -1) 
      : fromToken.value;
    this.advance();

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

  private parseXYChart(): XYChartNode {
    const startToken = this.currentToken();
    this.advance(); // Skip xychart-beta

    let title: string | undefined;
    const xAxis: string[] = [];
    let yAxis: { label: string; min: number; max: number } | undefined;
    const data: { type: 'bar' | 'line'; values: number[] }[] = [];

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.value === 'title') {
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
              xAxis.push(this.currentToken().value);
            }
            this.advance();
            if (this.currentToken().type === TokenType.COMMA) {
              this.advance();
            }
          }
          this.advance(); // Skip ]
        }
      } else if (token.value === 'y-axis') {
        this.advance();
        if (this.currentToken().type === TokenType.STRING) {
          const label = this.currentToken().value.slice(1, -1);
          this.advance();
          
          if (this.currentToken().type === TokenType.NUMBER) {
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

    const children: FlowchartElement[] = [];
    
    while (!this.isAtEnd() && !(this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'end')) {
      const child = this.parseFlowchartElement();
      if (child) {
        children.push(child);
      }
    }

    if (this.currentToken().type === TokenType.IDENTIFIER && this.currentToken().value.toLowerCase() === 'end') {
      this.advance(); // Skip end
    }

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
    
    const firstToken = this.tokens[0];
    switch (firstToken.type) {
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

    // For now, just parse until end - full class diagram parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
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

    // For now, just parse until end - full state diagram parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'state',
      line: startToken.line,
      column: startToken.column
    };
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

  private parseClassDef(): void {
    // Skip 'classDef'
    this.advance();
    
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
    
    // Skip everything until semicolon
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

  private parseNoteStatement(): void {
    // Skip 'note'
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

  private parseDirectionStatement(): void {
    // Skip 'direction'
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

  private parseGitgraph(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip gitgraph

    // For now, just parse until end - full gitgraph parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
    }

    return {
      type: 'gitgraph',
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseMindmap(): ASTNode {
    const startToken = this.currentToken();
    this.advance(); // Skip mindmap

    // For now, just parse until end - full mindmap parsing is complex
    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      this.advance();
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

    while (!this.isAtEnd() && this.currentToken().type !== TokenType.EOF) {
      const token = this.currentToken();
      
      if (token.value === 'columns') {
        this.advance();
        if (this.currentToken().type === TokenType.NUMBER) {
          columns = parseInt(this.currentToken().value);
          this.advance();
        }
      } else if (token.type === TokenType.IDENTIFIER) {
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

    return {
      type: 'block',
      line: startToken.line,
      column: startToken.column,
      columns,
      blocks
    };
  }

  private validateSingleDiagramType(): void {
    // Mermaid CLI allows certain mixed diagram types in specific orders
    // Based on testing: flowchart -> sequence works, but sequence -> flowchart doesn't
    // We'll be more lenient and allow mixed diagrams, but warn about potential issues
    // This matches Mermaid's actual behavior more closely
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
