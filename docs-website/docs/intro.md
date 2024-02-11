---
sidebar_position: 1
---

# Getting Started

**Installation**
```bash
npm i lite-utility
```

## Usage
```js
import { wait } from 'lite-utility'

(async () => {
  console.log('Start')
  await wait(5000)
  console.log('End')
})()
```
