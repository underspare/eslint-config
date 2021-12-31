import React from 'react';
import { NAMESPACES, NAMESPACE_CONFIG, Namespace, Rule } from '../config';

export default function App() {

  return (
    <>
      {
        Object.values<Rule>(NAMESPACE_CONFIG['base'].ruleConfig).map(
          (
            {
              name,
              value,
              description,
              reason,
              badExample,
              goodExample,
              fixable,
              extendsBaseRule,
              requiresTypeChecking,
            }
          ) => (
            <div
              key={name}
            >
              <hr></hr>

              name:
              <div>{name}</div>

              value:
              <div>{JSON.stringify(value)}</div>

              description:
              <div>{description}</div>

              reason:
              <div>{reason}</div>

              fixable:
              <div>{fixable}</div>

              extendsBaseRule:
              <div>{extendsBaseRule}</div>

              requiresTypeChecking:
              <div>{requiresTypeChecking}</div>

              badExample:
              {
                badExample && (
                  <pre className={`language-${NAMESPACE_CONFIG['base'].prismLanguage}`} >
                    <code
                      dangerouslySetInnerHTML={{
                        __html: badExample,
                      }}
                    />
                  </pre>
                )
              }

              goodExample:
              {
                goodExample && (
                  <pre className={`language-${NAMESPACE_CONFIG['base'].prismLanguage}`}>
                    <code
                      dangerouslySetInnerHTML={{
                        __html: goodExample,
                      }}
                    />
                  </pre>
                )
              }
            </div>
          )
        )
      }
    </>
  );
}
