import fs from 'fs';
import path from 'path';

import doctrine from 'doctrine';
import prettier from 'prettier';
import { ESLint, Linter } from 'eslint';
import insertTag from 'insert-tag';
import xmlEscape from 'xml-escape';

import { Namespace, NAMESPACES, NAMESPACE_CONFIG, Rule, locale } from '../config';
import '../utils/prism';

const eslintInstance = new ESLint({});

declare const Prism: any;

type RuleMetaMap = {
  [key: string]: {
    fixable: boolean;
    extendsBaseRule: string;
    requiresTypeChecking: boolean;
  }
}

class Builder {

  private namespace: Namespace = NAMESPACES[0];
  private ruleMetaMap: RuleMetaMap = {};
  private ruleList: Rule[] = []
  private rulesContent = '';
  private initialEslintrcContent = '';
  private baseRuleConfig: {
    [key: string]: Rule;
  } = {};

  public async build(namespace: Namespace) {
    this.namespace = namespace;
    this.ruleMetaMap = this.getRuleMetaMap();
    this.ruleList = await this.getRuleList();
    this.rulesContent = this.getRulesContent();
    this.initialEslintrcContent = this.getInitialEslintrc();
    this.buildRulesJson();
    this.buildLocaleJson();
    this.buildEslintrc();
  }

  private buildRulesJson() {
    const ruleConfig = this.ruleList.reduce<{
      [key: string]: Rule;
    }>(
      (prev, rule) => {
        prev[rule.name] = rule;
        return prev;
      },
      {}
    );

    /** build base 时，暂存当前 ruleConfig，供后续继承用 */
    if (this.namespace === 'base') {
      this.baseRuleConfig = ruleConfig;
    }

    this.writeWithPrettier(
      path.resolve(__dirname, `../config/rules/${this.namespace}.json`),
      JSON.stringify(ruleConfig),
      'json',
    );
  }

  private buildLocaleJson() {
    const current: any = locale['en-US'];

    Object.values(this.ruleList).forEach((rule) => {
      if (!current[rule.description]) {
        current[rule.description] = rule.description;
      }
      if (rule.reason && !current[rule.reason]) {
        current[rule.reason] = rule.reason;
      }
    });

    this.writeWithPrettier(path.resolve(__dirname, '../config/locale/en-US.json'), JSON.stringify(current), 'json');
  }

  private buildEslintrc() {
    const eslintrcContent = this.initialEslintrcContent
      // 去掉 extends
      .replace(/extends:.*],/, '')
      // 将 rulesContent 写入 rules
      .replace(/(,\s*rules: {([\s\S]*?)})?,\s*};/, (_match, _p1, p2) => {
        const rules = p2 ? `${p2}${this.rulesContent}` : this.rulesContent;
        return `,rules:{${rules}}};`;
      });

    this.writeWithPrettier(path.resolve(__dirname, `../${this.namespace}.js`), eslintrcContent);
  }

  private writeWithPrettier(filePath: string, content: string, parser = 'babel') {
    fs.writeFileSync(
      filePath,
      // 使用 prettier 格式化文件内容
      prettier.format(content, {
        ...require('../.prettierrc'),
        parser,
      }),
      'utf-8',
    );
  }

  private getRuleMetaMap() {
    const { rulePrefix, pluginName } = NAMESPACE_CONFIG[this.namespace]

    const ruleEntries = pluginName
      ? Object.entries<any>(require(pluginName).rules)
      : Array.from<any>(require('eslint/lib/rules').entries());

    return ruleEntries.reduce(
      (prev, [ruleName, ruleValue]) => {
        const fullRuleName = rulePrefix + ruleName;
        const meta = ruleValue.meta;

        prev[fullRuleName] = {
          fixable: meta.fixable === 'code',
          extendsBaseRule:
            // meta.docs.extendsBaseRule 若为 string，则表示继承的规则
            // 若为 true，则提取继承的规则的名称
            meta.docs.extensionRule === true || meta.docs.extendsBaseRule === true
              ? ruleName.replace(NAMESPACE_CONFIG[this.namespace].rulePrefix, '')
              : meta.docs.extendsBaseRule ?? '',
          requiresTypeChecking: meta.docs.requiresTypeChecking ?? false,
        };

        return prev;
      },
      {}
    )
  }

  private async getRuleList() {
    const ruleList = await Promise.all(
      fs
        .readdirSync(path.resolve(__dirname, '../rules', this.namespace))
        .filter((ruleName) => fs.lstatSync(path.resolve(__dirname, '../rules/', this.namespace, ruleName)).isDirectory())
        .map((ruleName) => this.getRule(ruleName)),
    );

    return ruleList;
  }

  private getRulesContent() {
    return this.ruleList
      .map((rule) => {
        let content = ['\n/**', ...rule.description.split('\n').map((line) => ` * ${line}`)];
        if (rule.reason) {
          content = [
            ...content,
            ...rule.reason.split('\n').map((line, index) => (index === 0 ? ` * @reason ${line}` : ` * ${line}`)),
          ];
        }
        content.push(' */');
        // 若继承自基础规则，则需要先关闭基础规则
        const extendsBaseRule = this.ruleMetaMap[rule.name].extendsBaseRule;
        if (extendsBaseRule) {
          content.push(`'${extendsBaseRule}': 'off',`);
        }
        content.push(`'${rule.name}': ${JSON.stringify(rule.value, null, 4)},`);
        return content.join('\n    ');
      })
      .join('');
  }

  private getInitialEslintrc() {
    const initialEslintrcPath = path.resolve(__dirname, `../rules/${this.namespace}/.eslintrc.js`);
    if (!fs.existsSync(initialEslintrcPath)) {
      return '';
    }
    return fs.readFileSync(initialEslintrcPath, 'utf-8');
  }

  private async getRule(ruleName: string) {
    const filePath = path.resolve(__dirname, '../rules', this.namespace, ruleName, '.eslintrc.js');
    const fileModule = require(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const fullRuleName = NAMESPACE_CONFIG[this.namespace].rulePrefix + ruleName;
    const comments = /\/\*\*.*\*\//gms.exec(fileContent);
    const rule: Rule = {
      name: fullRuleName,
      value: fileModule.rules[fullRuleName],
      description: '',
      reason: '',
      badExample: '',
      goodExample: '',
      ...this.ruleMetaMap[fullRuleName],
    };

    if (comments !== null) {
      // 通过 doctrine 解析注释
      const commentsAST = doctrine.parse(comments[0], { unwrap: true });
      // 将注释体解析为 description
      rule.description = commentsAST.description;
      // 解析其他的注释内容，如 @reason
      rule.reason = commentsAST.tags.find(({ title }) => title === 'reason')?.description ?? '';
    }
    // 若没有描述，并且有继承的规则，则使用继承的规则的描述
    if (!rule.description && rule.extendsBaseRule) {
      rule.description = this.baseRuleConfig[rule.extendsBaseRule].description;
    }
    // 若没有原因，并且有继承的规则，并且本规则的配置项与继承的规则的配置项一致，则使用继承的规则的原因
    if (
      !rule.reason &&
      rule.extendsBaseRule &&
      JSON.stringify(rule.value) === JSON.stringify(this.baseRuleConfig[rule.extendsBaseRule].value)
    ) {
      rule.reason = this.baseRuleConfig[rule.extendsBaseRule].reason;
    }

    const badFilePath = path.resolve(
      path.dirname(filePath),
      `bad.${NAMESPACE_CONFIG[this.namespace].exampleExtension}`,
    );

    const goodFilePath = path.resolve(
      path.dirname(filePath),
      `good.${NAMESPACE_CONFIG[this.namespace].exampleExtension}`,
    );

    if (fs.existsSync(badFilePath)) {
      const results = await eslintInstance.lintFiles([badFilePath]);
      // 通过 Prism 和 insertMark 生成 html 格式的代码
      rule.badExample = this.insertMark(
        Prism.highlight(
          fs.readFileSync(badFilePath, 'utf-8'),
          Prism.languages[NAMESPACE_CONFIG[this.namespace].prismLanguage],
          NAMESPACE_CONFIG[this.namespace].prismLanguage,
        ),
        results[0].messages,
      ).trim();
    }

    if (fs.existsSync(goodFilePath)) {
      rule.goodExample = Prism.highlight(
        fs.readFileSync(goodFilePath, 'utf-8'),
        Prism.languages[NAMESPACE_CONFIG[this.namespace].prismLanguage],
        NAMESPACE_CONFIG[this.namespace].prismLanguage,
      ).trim();
    }

    return rule;
  }

  private insertMark(badExample: string, eslintMessages: Linter.LintMessage[]) {
    let insertedBadExample = badExample;

    eslintMessages.forEach(({ ruleId, message, line, column, endLine, endColumn }) => {
      const insertLine = line - 1;
      const insertColumn = column - 1;
      const insertLineEnd = (endLine || line) - 1;
      let insertColumnEnd = (endColumn || column + 1) - 1;

      if (insertLineEnd === insertLine && insertColumnEnd === insertColumn) {
        insertColumnEnd = insertColumnEnd + 1;
      }

      insertedBadExample = insertTag(
        insertedBadExample,
        `<mark class="eslint-error" data-tip="${`${xmlEscape(
          xmlEscape(message),
        )}&lt;br/&gt;&lt;span class='eslint-error-rule-id'&gt;eslint(${ruleId})&lt;/span&gt;`}">`,
        [insertLine, insertColumn, insertLineEnd, insertColumnEnd],
      );
    });

    return insertedBadExample;
  }
}

async function main() {
  const builder = new Builder();
  for (const namespace of NAMESPACES) {
    await builder.build(namespace);
  }
}

main();
