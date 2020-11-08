import Colors from 'colors'
import { EColor, EEdgeRotation, ERotateDirection, ESide } from './enums'
import { ICell, ICube, IEdge, IRotation } from './interfaces'

export class Cell implements ICell {
  color: EColor
  number: number

  constructor(options: ICell) {
    this.color = options.color
    this.number = options.number
  }

  toString(): string {
    return Colors[EColor[this.color]](this.number)
  }
}

export class Edge {

  private edge: IEdge

  constructor(options?: Partial<IEdge>) {
    this.edge = {
      size: 3,
      cells: [],
      ...options,
    }
  }

  public init(color: EColor): void {
    this.edge.cells = []
    for (let line = 0; line < this.edge.size; line++) {
      this.edge.cells[line] = []
      for (let row = 0; row < this.edge.size; row++) {
        const cell = new Cell({
          color,
          number: line * this.edge.size + row + 1
        })
        this.edge.cells[line][row] = cell
      }
    }
  }

  public print(): void {
    let text = ''
    for (let line = 0; line < this.edge.size; line++) {
      for (let row = 0; row < this.edge.size; row++) {
        const cell = this.edge.cells[line][row]
        text += "\t" + cell.toString()
      }
      text += "\n"
    }
    console.log(text)
  }

  public get value(): number {
    let value = 0
    for (let line = 0; line < this.edge.size; line++) {
      for (let row = 0; row < this.edge.size; row++) {
        const cell = this.edge.cells[line][row]
        const upCell = this.edge.cells[line - 1] ? this.edge.cells[line - 1][row] : null
        const leftCell = this.edge.cells[line][row - 1]
        const downCell = this.edge.cells[line + 1] ? this.edge.cells[line + 1][row] : null
        const rightCell = this.edge.cells[line][row + 1]

        value += upCell && upCell.color == cell.color ? 1 : 0
        value += leftCell && leftCell.color == cell.color ? 1 : 0
        value += downCell && downCell.color == cell.color ? 1 : 0
        value += rightCell && rightCell.color == cell.color ? 1 : 0
      }
    }
    return value / 2
  }

  public getLine(line: number): ICell[] {
    return this.edge.cells[line];
  }

  public setLine(line: number, cells: ICell[]): void {
    this.edge.cells[line] = [
      ...cells,
    ];
  }

  public getRow(row: number): ICell[] {
    return this.edge.cells.map((line) => { return line[row] });
  }

  public setRow(row: number, cells: ICell[]): void {
    for (let line = 0; line < this.edge.size; line++) {
      for (let _row = 0; _row < this.edge.size; _row++) {
        if (_row === row) {
          this.edge.cells[line][row] = cells[line]
        }
      }
    }
  }


  public rotate(direction: EEdgeRotation): void {
    const cells = this.edge.cells
    const size = this.edge.size - 1
    if (direction === EEdgeRotation.forward) {
      for (let line = 0; line < (size + 1) / 2; line++) {
        for (let row = line; row < size - line; row++) {
          const buffer = cells[line][row]
          cells[line][row] = cells[size - row][line]
          cells[size - row][line] = cells[size - line][size - row]
          cells[size - line][size - row] = cells[row][size - line]
          cells[row][size - line] = buffer
        }
      }
    }
    if (direction === EEdgeRotation.backward) {
      for (let line = 0; line < (size + 1) / 2; line++) {
        for (let row = line; row < size - line; row++) {
          const buffer = cells[line][row]
          cells[line][row] = cells[row][size - line]
          cells[row][size - line] = cells[size - line][size - row]
          cells[size - line][size - row] = cells[size - row][line]
          cells[size - row][line] = buffer
        }
      }
    }
  }

}

export class Cube {
  private cube: ICube

  private sides: {
    [key in ESide]?: Edge
  } = {}

  constructor(options?: Partial<ICube>) {
    this.cube = {
      size: 3,
      ...options,
    }
    this.init()
  }

  public init(): void {
    for (const side in ESide) {
      if (typeof ESide[side] === 'string') {
        const edge = new Edge({
          size: this.cube.size
        })
        edge.init(side as unknown as EColor)
        this.sides[side] = edge
      }
    }
  }

  public print(): void {
    for (const side in ESide) {
      if (typeof ESide[side] === 'string') {
        const slide = this.sides[side] as Edge
        console.log(Colors.bold(ESide[side]), `= ${slide.value}`)
        slide.print()
      }
    }
    console.log(`Value = ${this.value}`)
  }

  public get value(): number {
    let value = 0    
    for (const side in ESide) {
      if (typeof ESide[side] === 'string') {
        value += this.sides[side].value
      }
    }
    return value
  }

  public get size(): number {
    return this.cube.size
  }

  public rotate(rotation: IRotation): void {
    switch (rotation.direction) {
      case ERotateDirection.frontForward:
        this.swapLines(ESide.front, ESide.left, rotation.line)
        this.swapLines(ESide.right, ESide.back, rotation.line)
        this.swapLines(ESide.back, ESide.front, rotation.line)
        if (rotation.line === 0) {
          this.sides[ESide.top].rotate(EEdgeRotation.forward)
        }
        if (rotation.line === this.cube.size - 1) {
          this.sides[ESide.bottom].rotate(EEdgeRotation.backward)
        }
        break
      case ERotateDirection.frontBackward:
        this.swapLines(ESide.front, ESide.right, rotation.line)
        this.swapLines(ESide.left, ESide.back, rotation.line)
        this.swapLines(ESide.back, ESide.front, rotation.line)
        if (rotation.line === 0) {
          this.sides[ESide.top].rotate(EEdgeRotation.backward)
        }
        if (rotation.line === this.cube.size - 1) {
          this.sides[ESide.bottom].rotate(EEdgeRotation.forward)
        }
        break
      case ERotateDirection.topForward:
        this.swapRows(ESide.front, ESide.top, rotation.line)
        this.swapRows(ESide.bottom, ESide.back, rotation.line)
        this.swapRows(ESide.front, ESide.back, rotation.line)
        if (rotation.line === 0) {
          this.sides[ESide.left].rotate(EEdgeRotation.backward)
        }
        if (rotation.line === this.cube.size - 1) {
          this.sides[ESide.right].rotate(EEdgeRotation.forward)
        }
        break
      case ERotateDirection.topBackward:
        this.swapRows(ESide.front, ESide.bottom, rotation.line)
        this.swapRows(ESide.top, ESide.back, rotation.line)
        this.swapRows(ESide.front, ESide.back, rotation.line)
        if (rotation.line === 0) {
          this.sides[ESide.left].rotate(EEdgeRotation.forward)
        }
        if (rotation.line === this.cube.size - 1) {
          this.sides[ESide.right].rotate(EEdgeRotation.backward)
        }
        break
      case ERotateDirection.rightForward:
        this.swapLineRows(this.size - rotation.line - 1, this.size - rotation.line - 1, ESide.right, ESide.bottom)
        this.swapLineRows(rotation.line, rotation.line, ESide.left, ESide.top)
        this.swapRows(ESide.right, ESide.left, this.size - rotation.line - 1, rotation.line)
        if (rotation.line === 0) {
          this.sides[ESide.back].rotate(EEdgeRotation.backward)
        }
        if (rotation.line === this.cube.size - 1) {
          this.sides[ESide.front].rotate(EEdgeRotation.forward)
        }
        break
      case ERotateDirection.rightBackward:
        this.swapLineRows(this.size - rotation.line - 1, this.size - rotation.line - 1, ESide.right, ESide.bottom)
        this.swapLineRows(rotation.line, rotation.line, ESide.left, ESide.top)
        this.swapLines(ESide.top, ESide.bottom, rotation.line, this.size - rotation.line - 1)
        // if (rotation.line === 0) {
        //   this.sides[ESide.back].rotate(EEdgeRotation.backward)
        // }
        // if (rotation.line === this.cube.size - 1) {
        //   this.sides[ESide.front].rotate(EEdgeRotation.forward)
        // }
        break
    }
  }

  private swapLines(side1: ESide, side2: ESide, line1: number, line2?: number): void {
    const edge1 = this.sides[side1]
    const edge2 = this.sides[side2]

    if (typeof line2 !== 'number') {
      line2 = line1
    }
    const buffer = edge1.getLine(line1)
    edge1.setLine(line1, edge2.getLine(line2))
    edge2.setLine(line2, buffer)
  }

  private swapRows(side1: ESide, side2: ESide, row1: number, row2?: number): void {
    const edge1 = this.sides[side1]
    const edge2 = this.sides[side2]

    if (typeof row2 !== 'number') {
      row2 = row1
    }
    const buffer = edge1.getRow(row1)
    edge1.setRow(row1, edge2.getRow(row2))
    edge2.setRow(row2, buffer)
  }

  private swapLineRows(line: number, row: number, lineSide: ESide, rowSide: ESide): void {
    const rowEdge = this.sides[lineSide]
    const lineEdge = this.sides[rowSide]

    const buffer = rowEdge.getRow(row)
    rowEdge.setRow(row, lineEdge.getLine(line))
    lineEdge.setLine(line, buffer)
  }

}