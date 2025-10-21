// Token types for Mermaid syntax
export enum TokenType {
  // Diagram declarations
  GRAPH = 'GRAPH',
  FLOWCHART = 'FLOWCHART',
  SEQUENCE_DIAGRAM = 'SEQUENCE_DIAGRAM',
  CLASS_DIAGRAM = 'CLASS_DIAGRAM',
  STATE_DIAGRAM = 'STATE_DIAGRAM',
  STATE_DIAGRAM_V2 = 'STATE_DIAGRAM_V2',
  ER_DIAGRAM = 'ER_DIAGRAM',
  JOURNEY = 'JOURNEY',
  GANTT = 'GANTT',
  PIE = 'PIE',
  GITGRAPH = 'GITGRAPH',
  MINDMAP = 'MINDMAP',
  TIMELINE = 'TIMELINE',
  XYCHART_BETA = 'XYCHART_BETA',
  BLOCK_BETA = 'BLOCK_BETA',

  // Flowchart specific
  ARROW = 'ARROW',
  DOTTED_ARROW = 'DOTTED_ARROW',
  THICK_ARROW = 'THICK_ARROW',
  SUBGRAPH = 'SUBGRAPH',
  SUBGRAPH_END = 'SUBGRAPH_END',

  // Sequence diagram specific
  PARTICIPANT = 'PARTICIPANT',
  ACTIVATION = 'ACTIVATION',
  DEACTIVATION = 'DEACTIVATION',
  NOTE = 'NOTE',
  SEQUENCE_ARROW = 'SEQUENCE_ARROW',

  // Common
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BRACKET_OPEN = 'BRACKET_OPEN',
  BRACKET_CLOSE = 'BRACKET_CLOSE',
  PAREN_OPEN = 'PAREN_OPEN',
  PAREN_CLOSE = 'PAREN_CLOSE',
  DOUBLE_PAREN_OPEN = 'DOUBLE_PAREN_OPEN',
  DOUBLE_PAREN_CLOSE = 'DOUBLE_PAREN_CLOSE',
  BRACE_OPEN = 'BRACE_OPEN',
  BRACE_CLOSE = 'BRACE_CLOSE',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  COLON = 'COLON',
  PIPE = 'PIPE',
  EQUALS = 'EQUALS',
  NEWLINE = 'NEWLINE',
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  DIRECTIVE = 'DIRECTIVE',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  position: number;
}

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    // Reset lexer state
    this.position = 0;
    this.line = 1;
    this.column = 1;
    
    const tokens: Token[] = [];
    let token: Token | null;

    while ((token = this.nextToken()) !== null && token.type !== TokenType.EOF) {
      tokens.push(token);
    }

    // Always add EOF token
    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column,
      position: this.position
    });

    return tokens;
  }

  private nextToken(): Token | null {
    if (this.position >= this.input.length) {
      return null;
    }

    const char = this.input[this.position];

    // Skip whitespace
    if (/\s/.test(char)) {
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
      return this.nextToken();
    }

    // Comments and directives
    if (char === '%' && this.position + 1 < this.input.length && this.input[this.position + 1] === '%') {
      // Check if this is a directive %%{...}%%
      if (this.position + 2 < this.input.length && this.input[this.position + 2] === '{') {
        return this.readDirective();
      } else {
        return this.readComment();
      }
    }

    // Check for double parentheses (double-circle nodes)
    if (char === '(' && this.position + 1 < this.input.length && this.input[this.position + 1] === '(') {
      this.position += 2;
      this.column += 2;
      return {
        type: TokenType.DOUBLE_PAREN_OPEN,
        value: '((',
        line: this.line,
        column: this.column - 2,
        position: this.position - 2
      };
    }
    
    if (char === ')' && this.position + 1 < this.input.length && this.input[this.position + 1] === ')') {
      this.position += 2;
      this.column += 2;
      return {
        type: TokenType.DOUBLE_PAREN_CLOSE,
        value: '))',
        line: this.line,
        column: this.column - 2,
        position: this.position - 2
      };
    }

    // Single character tokens (but check for arrows first)
    const singleCharTokens: { [key: string]: TokenType } = {
      '[': TokenType.BRACKET_OPEN,
      ']': TokenType.BRACKET_CLOSE,
      '(': TokenType.PAREN_OPEN,
      ')': TokenType.PAREN_CLOSE,
      '{': TokenType.BRACE_OPEN,
      '}': TokenType.BRACE_CLOSE,
      ',': TokenType.COMMA,
      ';': TokenType.SEMICOLON,
      ':': TokenType.COLON,
      '|': TokenType.PIPE
    };

    // Handle equals separately to check for thick arrows first
    if (char === '=') {
      // Check for thick arrows: ==> (but not ==>>)
      if (this.position + 2 < this.input.length && 
          this.input[this.position + 1] === '=' && this.input[this.position + 2] === '>') {
        // Check if this is ==>> (which is not supported)
        if (this.position + 3 < this.input.length && this.input[this.position + 3] === '>') {
          // This is ==>> which is not supported - treat as separate tokens
          const token = {
            type: TokenType.EQUALS,
            value: char,
            line: this.line,
            column: this.column,
            position: this.position
          };
          this.position++;
          this.column++;
          return token;
        } else {
          // This is ==> which is supported
          const arrowValue = '==>';
          this.position += 3;
          this.column += 3;
          
          return {
            type: TokenType.THICK_ARROW,
            value: arrowValue,
            line: this.line,
            column: this.column - arrowValue.length + 1,
            position: this.position - arrowValue.length
          };
        }
      } else {
        // Regular equals
        const token = {
          type: TokenType.EQUALS,
          value: char,
          line: this.line,
          column: this.column,
          position: this.position
        };
        this.position++;
        this.column++;
        return token;
      }
    }

    if (singleCharTokens[char]) {
      const token = {
        type: singleCharTokens[char],
        value: char,
        line: this.line,
        column: this.column,
        position: this.position
      };
      this.position++;
      this.column++;
      return token;
    }

    // Arrows (check longer sequences first)
    // Check for dotted arrows: -.-> or -.->>
    if (char === '-' && this.position + 3 < this.input.length && 
        this.input[this.position + 1] === '.' && this.input[this.position + 2] === '-' && 
        this.input[this.position + 3] === '>') {
      let arrowValue = '-.->';
      let arrowType = TokenType.DOTTED_ARROW;
      
      if (this.position + 4 < this.input.length && this.input[this.position + 4] === '>') {
        arrowValue = '-.->>';
        this.position += 5;
        this.column += 5;
      } else {
        this.position += 4;
        this.column += 4;
      }
      
      return {
        type: arrowType,
        value: arrowValue,
        line: this.line,
        column: this.column - arrowValue.length + 1,
        position: this.position - arrowValue.length
      };
    }
    
    // Regular arrows: --> or -->>
    if (char === '-' && this.position + 2 < this.input.length && 
        this.input[this.position + 1] === '-' && this.input[this.position + 2] === '>') {
      // Check for different arrow types
      let arrowValue = '-->';
      let arrowType = TokenType.ARROW;
      
      if (this.position + 3 < this.input.length && this.input[this.position + 3] === '>') {
        arrowValue = '-->>';
        this.position += 4;
        this.column += 4;
      } else {
        this.position += 3;
        this.column += 3;
      }
      
      return {
        type: arrowType,
        value: arrowValue,
        line: this.line,
        column: this.column - arrowValue.length + 1,
        position: this.position - arrowValue.length
      };
    }

    // Single sequence arrows
    if (char === '-' && this.position + 1 < this.input.length && this.input[this.position + 1] === '>') {
      // Check for different arrow types
      let arrowValue = '->';
      let arrowType = TokenType.SEQUENCE_ARROW;
      
      if (this.position + 2 < this.input.length && this.input[this.position + 2] === '>') {
        arrowValue = '->>';
        this.position += 3;
        this.column += 3;
      } else {
        this.position += 2;
        this.column += 2;
      }
      
      return {
        type: arrowType,
        value: arrowValue,
        line: this.line,
        column: this.column - arrowValue.length + 1,
        position: this.position - arrowValue.length
      };
    }

    // Strings
    if (char === '"' || char === "'") {
      return this.readString();
    }

    // Numbers
    if (/\d/.test(char)) {
      return this.readNumber();
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      return this.readIdentifier();
    }

    // Unknown character - treat as identifier (handle Unicode surrogate pairs)
    const codePoint = this.input.codePointAt(this.position);
    if (codePoint === undefined) {
      return null;
    }
    
    // Get the full character (including surrogate pairs)
    const charValue = String.fromCodePoint(codePoint);
    const charLength = charValue.length;
    
    const token = {
      type: TokenType.IDENTIFIER,
      value: charValue,
      line: this.line,
      column: this.column,
      position: this.position
    };
    this.position += charLength;
    this.column++;
    return token;
  }

  private readComment(): Token {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    this.position += 2; // Skip %%
    this.column += 2;

    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      this.position++;
      this.column++;
    }

    // Consume the newline if present
    if (this.position < this.input.length && this.input[this.position] === '\n') {
      this.position++;
      this.line++;
      this.column = 1;
    }

    return {
      type: TokenType.COMMENT,
      value: this.input.slice(start, this.position),
      line: startLine,
      column: startColumn,
      position: start
    };
  }

  private readDirective(): Token {
    const start = this.position;
    this.position += 3; // Skip %%{
    this.column += 3;

    let braceCount = 1; // We've already seen the opening {
    
    while (this.position < this.input.length && braceCount > 0) {
      const char = this.input[this.position];
      
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      } else if (char === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      
      this.position++;
    }

    // Check if we found the closing %% pattern
    if (this.position + 1 < this.input.length && 
        this.input[this.position] === '%' && 
        this.input[this.position + 1] === '%') {
      this.position += 2; // Skip closing %%
      this.column += 2;
    }

    return {
      type: TokenType.DIRECTIVE,
      value: this.input.slice(start, this.position),
      line: this.line,
      column: this.column,
      position: start
    };
  }

  private readString(): Token {
    const quote = this.input[this.position];
    const start = this.position;
    this.position++;
    this.column++;

    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }

    if (this.position < this.input.length) {
      this.position++;
      this.column++;
    }

    return {
      type: TokenType.STRING,
      value: this.input.slice(start, this.position),
      line: this.line,
      column: this.column,
      position: start
    };
  }

  private readNumber(): Token {
    const start = this.position;
    
    while (this.position < this.input.length && /\d/.test(this.input[this.position])) {
      this.position++;
      this.column++;
    }

    return {
      type: TokenType.NUMBER,
      value: this.input.slice(start, this.position),
      line: this.line,
      column: this.column,
      position: start
    };
  }

  private readIdentifier(): Token {
    const start = this.position;
    
    while (this.position < this.input.length && /[a-zA-Z0-9_'-]/.test(this.input[this.position])) {
      // Don't consume hyphens that might be part of arrows
      if (this.input[this.position] === '-' && this.position + 1 < this.input.length && 
          this.input[this.position + 1] === '>') {
        break;
      }
      // Don't consume hyphens that might be part of sequence arrows
      if (this.input[this.position] === '-' && this.position + 2 < this.input.length && 
          this.input[this.position + 1] === '-' && this.input[this.position + 2] === '>') {
        break;
      }
      this.position++;
      this.column++;
    }

    const value = this.input.slice(start, this.position);
    
    // Check for keywords (case-insensitive)
    const keywords: { [key: string]: TokenType } = {
      'graph': TokenType.GRAPH,
      'flowchart': TokenType.FLOWCHART,
      'sequencediagram': TokenType.SEQUENCE_DIAGRAM,
      'classdiagram': TokenType.CLASS_DIAGRAM,
      'statediagram': TokenType.STATE_DIAGRAM,
      'statediagram-v2': TokenType.STATE_DIAGRAM_V2,
      'erdiagram': TokenType.ER_DIAGRAM,
      'journey': TokenType.JOURNEY,
      'gantt': TokenType.GANTT,
      'pie': TokenType.PIE,
      'gitgraph': TokenType.GITGRAPH,
      'mindmap': TokenType.MINDMAP,
        'timeline': TokenType.TIMELINE,
        'xychart-beta': TokenType.XYCHART_BETA,
        'block-beta': TokenType.BLOCK_BETA,
        'participant': TokenType.PARTICIPANT,
      'activate': TokenType.ACTIVATION,
      'deactivate': TokenType.DEACTIVATION,
      'note': TokenType.IDENTIFIER, // Keep as identifier for special handling
      'subgraph': TokenType.SUBGRAPH,
      'classdef': TokenType.IDENTIFIER, // Keep as identifier for special handling
      'class': TokenType.IDENTIFIER, // Keep as identifier for special handling
      'linkstyle': TokenType.IDENTIFIER, // Keep as identifier for special handling
      'style': TokenType.IDENTIFIER // Keep as identifier for special handling
      // Note: 'end' removed from general keywords to avoid conflicts with identifiers
    };

    const type = keywords[value.toLowerCase()] || TokenType.IDENTIFIER;

    return {
      type,
      value, // Keep original case for all tokens
      line: this.line,
      column: this.column,
      position: start
    };
  }
}
