export const NAMESPACE_CONFIG = {
  base: {
    // bad/good.js 的后缀 
    exampleExtension: 'js',
    // Prism 语言设置
    prismLanguage: 'js',
    // 插件前缀
    rulePrefix: '',
    // 规则配置 
    ruleConfig: require('./rules/base.json'),
    // 各插件的规则文档地址
    getDocsUrl: (rule: string) => `https://eslint.org/docs/rules/${rule}`,
    // 插件名称
    pluginName: undefined,
  },
};

export type Namespace = keyof typeof NAMESPACE_CONFIG;
export const NAMESPACES = Object.keys(NAMESPACE_CONFIG) as Namespace[];
