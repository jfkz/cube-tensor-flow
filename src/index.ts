import dotenvLoad from 'dotenv-load'
dotenvLoad()

import { Cube } from './structures';
import logger from "./helpers/logger";

logger.info('Started')

const cubeSize = 3

const cube = new Cube({
  size: cubeSize
})
const maxValue = cube.value
logger.debug('MAX VALUE', maxValue)

cube.print()

for(let i = 0; i < 23; i++) {
  const side = Math.floor(Math.random() * 3 + 1)
  const direction = Math.random() > 0.5 ? -1 : 1
  const rotation = side * direction
  const line = Math.floor(Math.random() * cubeSize)
  cube.rotate({
    direction: rotation,
    line
  })
}
cube.print()