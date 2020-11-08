import { EColor, ERotateDirection } from './enums';

export interface ICell {
  color: EColor
  number: number
}

export interface IEdge {
  size: number
  cells: ICell[][]
}

export interface ICube {
  size: number
}

export interface IRotation {
  line: number
  direction: ERotateDirection
}
