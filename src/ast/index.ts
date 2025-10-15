// AST Node definitions
export interface ASTNode {
  type: string;
  line: number;
  column: number;
}

export interface DiagramNode extends ASTNode {
  type: 'diagram';
  diagramType: string;
  direction?: string;
  content: ASTNode[];
}

export interface FlowchartNode extends ASTNode {
  type: 'flowchart';
  direction?: string;
  nodes: FlowchartElement[];
}

export interface FlowchartElement extends ASTNode {
  type: 'node' | 'arrow' | 'subgraph';
  id?: string;
  label?: string;
  shape?: 'rect' | 'round' | 'diamond' | 'circle';
  from?: string;
  to?: string;
  children?: FlowchartElement[];
}

export interface SequenceNode extends ASTNode {
  type: 'sequence';
  participants: ParticipantNode[];
  messages: MessageNode[];
}

export interface ParticipantNode extends ASTNode {
  type: 'participant';
  name: string;
  alias?: string;
}

export interface MessageNode extends ASTNode {
  type: 'message';
  from: string;
  to: string;
  message: string;
  arrowType: 'solid' | 'dotted' | 'thick';
}

export interface XYChartNode extends ASTNode {
  type: 'xychart';
  title?: string;
  xAxis: string[];
  yAxis: {
    label: string;
    min: number;
    max: number;
  };
  data: {
    type: 'bar' | 'line';
    values: number[];
  }[];
}

export interface BlockDiagramNode extends ASTNode {
  type: 'block';
  columns?: number;
  blocks: BlockElement[];
}

export interface BlockElement extends ASTNode {
  type: 'block';
  id: string;
  label: string;
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  code: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  diagramType: string;
  errors: ValidationError[];
  ast?: ASTNode;
}
