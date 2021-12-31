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
              <div className='block'>{name}</div>

              value:
              <div className='block'>{JSON.stringify(value)}</div>

              description:
              <div className='block'>{description}</div>

              reason:
              <div className='block'>{reason}</div>

              fixable:
              <div className='block'>{fixable}</div>

              extendsBaseRule:
              <div className='block'>{extendsBaseRule}</div>

              requiresTypeChecking:
              <div className='block'>{requiresTypeChecking}</div>

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
