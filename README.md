# lite-utility

A set of tools for quick js ts development

## Documentation

https://sid-max1996.github.io/lite-utility

**Installation**

```bash
npm i lite-utility
```

## Example

```js
import { wait } from 'lite-utility';

(async () => {
  console.log('Start');
  await wait(5000);
  console.log('End');
})();
```
