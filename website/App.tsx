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
              name:{name}
              value:{JSON.stringify(value)}
              description:{description}
              reason:{reason}
              fixable:{fixable}
              extendsBaseRule:{extendsBaseRule}
              requiresTypeChecking:{requiresTypeChecking}
              {
                badExample && (
                  <pre>
                    <code
                      dangerouslySetInnerHTML={{
                        __html: badExample,
                      }}
                    />
                  </pre>
                )
              }
              {
                goodExample && (
                  <pre>
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
