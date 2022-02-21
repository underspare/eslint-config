## 背景

> 每次新建项目项目做代码风格的配置时总是随便找一篇文章，也不管啥意思，把 .eslintrc.js 的配置一抄，再把对应的 NPM 包装上就算完事了

> ESlint 规则多且复杂只知其然不知其所以然，不同的开发者对其认识参差不齐

基于上述问题,于是有个这个 [`配置个性化 ESLint 规则参考`] 的站点；ESlint 不仅能做 [`代码质量的修复`] 也能做 [`代码风格的修复`]；但是，代码风格的修复不是 ESlint 的强项，代码风格的修复交给 [Prettier] 来管理。并且，这里会排除 ESlint 中代码风格的介绍。

Prettier 是一个更加专业的 [`Opinionated`] 代码格式化工具；Opinionated 意味着一切全包，开箱即用；它提供的代码风格已经是最优的，不希望使用者做太多自定义的内容，因此配置很少。

## 使用

### Base

```bash
npm install --save-dev eslint @babel/eslint-parser @underspare/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['@underspare/eslint-config/base'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### React

```bash
npm install --save-dev eslint @babel/eslint-parser @babel/preset-react@latest eslint-plugin-react @underspare/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['@underspare/eslint-config/base', '@underspare/eslint-config/react'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### TypeScript

```bash
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin @underspare/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: ['@underspare/eslint-config/base', '@underspare/eslint-config/typescript'],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

### TypeScript React

```bash
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react @underspare/eslint-config
```

在你的项目的根目录下创建一个 `.eslintrc.js` 文件，并将以下内容复制进去：

```js
module.exports = {
  extends: [
    '@underspare/eslint-config/base',
    '@underspare/eslint-config/react',
    '@underspare/eslint-config/typescript',
  ],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    // 自定义你的规则
  },
};
```

## 问题

### 在 VSCode 中使用

在 VSCode 中，默认 ESLint 并不能识别 `.vue`、`.ts` 或 `.tsx` 文件，需要在「文件 => 首选项 => 设置」里做如下配置：

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

### 保存时自动修复 ESLint 错误

如果想要开启「保存时自动修复」的功能，需要配置 `.vscode/settings.json`：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### VSCode 中的 autoFixOnSave 没有效果

如果需要针对 `.ts` 和 `.tsx` 文件开启 ESLint 的 autoFix，则需要配置成：

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    {
      "language": "typescript",
      "autoFix": true
    },
    {
      "language": "typescriptreact",
      "autoFix": true
    }
  ]
}
```

### 结合 Prettier 使用

只需要安装 `prettier` 及相关 VSCode 插件即可。VSCode 的一个最佳实践就是通过配置 `.vscode/settings.json` 来支持自动修复 Prettier 和 ESLint 错误：

```json
{
  "files.eol": "\n",
  "editor.tabSize": 2,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## References

- [https://eslint.org/](https://eslint.org/)
- [https://prettier.io/docs/en/index.html](https://prettier.io/docs/en/index.html)
- [https://typescript-eslint.io/](https://typescript-eslint.io/)
- [https://stylelint.io/](https://stylelint.io/)
- [https://github.com/typicode/husky](https://github.com/typicode/husky)
- [https://github.com/okonet/lint-staged](https://github.com/okonet/lint-staged)
- [https://zhuanlan.zhihu.com/p/81764012](https://zhuanlan.zhihu.com/p/81764012)
