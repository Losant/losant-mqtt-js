module.exports = {
    plugins: [
      'node'
    ],
    extends: [
      'eslint:recommended'
    ],
    env: {
      'es6': true,
      'es2020': true,
      'node': true,
      'mocha': true,
    },
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
      ecmaFeatures: {
        impliedStrict: true
      }
    },
    rules: {
      'accessor-pairs': 'error',
      'array-bracket-spacing': 'off',
      'array-callback-return': 'off',
      'arrow-body-style': 'off',                                                                      // https://github.com/Losant/eslint-config-losant/pull/3
      'arrow-parens': [
        'error',
        'always'
      ],
      'arrow-spacing': 'warn',
      'block-scoped-var': 'error',
      'block-spacing': [
        'error',
        'always'
      ],
      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true
        }
      ],
      'callback-return': 'error',
      'camelcase': [
        'error',
        {
          properties: 'never'
        }
      ],
      'capitalized-comments': 'off',
      'class-methods-use-this': 'off',
      'comma-dangle': ['warn', 'never'],                                                              // https://github.com/Losant/eslint-config-losant/pull/6
      'comma-spacing': [
        'warn',
        {
          after: true,
          before: false
        }
      ],
      'comma-style': [
        'error',
        'last'
      ],
      'complexity': ['error', 50],
      'computed-property-spacing': [
        'error',
        'never'
      ],
      'consistent-return': 'off',
      'consistent-this': 'off',
      'curly': 'error',
      'default-case': 'error',
      'dot-location': [
        'error',
        'property'
      ],
      'dot-notation': [
        'error',
        {
          allowKeywords: true
        }
      ],
      'eol-last': 'error',
      'eqeqeq': 'error',
      'for-direction': 'error',
      'func-call-spacing': 'error',
      'func-name-matching': 'error',
      'func-names': 'off',
      'func-style': ['error', 'expression'],                                                          // https://github.com/Losant/eslint-config-losant/pull/1
      'generator-star-spacing': 'error',
      'getter-return': 'error',
      'global-require': 'off',                                                                        // https://github.com/Losant/eslint-config-losant/pull/2
      'guard-for-in': 'error',
      'handle-callback-err': 'error',
      'id-blacklist': 'error',
      'id-length': 'off',
      'id-match': 'error',
      'indent': ['error', 2, { SwitchCase: 1 }],
      'init-declarations': 'off',
      'jsx-quotes': 'error',
      'key-spacing': [
        'warn',
        {
          beforeColon: false,
          afterColon: true,
          mode: 'minimum'
        }
      ],
      'keyword-spacing': 'error',
      'line-comment-position': 'off',
      'linebreak-style': [
        'error',
        'unix'
      ],
      'lines-around-comment': 'off',
      'lines-around-directive': 'off',
      'max-depth': 'error',
      'max-len': 'off',
      'max-lines': 'off',
      'max-nested-callbacks': 'error',
      'max-params': 'off',
      'max-statements': 'off',
      'max-statements-per-line': 'off',
      'multiline-ternary': 'off',
      'new-parens': 'error',
      'newline-after-var': 'off',
      'newline-before-return': 'off',
      'newline-per-chained-call': 'off',
      'no-alert': 'error',
      'no-array-constructor': 'error',
      'no-await-in-loop': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-catch-shadow': 'error',
      'no-confusing-arrow': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-continue': 'error',
      'no-div-regex': 'error',
      'no-duplicate-imports': 'error',
      'no-else-return': 'off',
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true
        }
      ],
      'no-empty-function': 'off',
      'no-eq-null': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-extra-parens': 'off',
      'no-floating-decimal': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-inline-comments': 'off',
      'no-inner-declarations': ['error', 'functions'],
      'no-invalid-this': 'off',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'off',
      'no-loop-func': 'error',
      'no-magic-numbers': 'off',
      'no-mixed-operators': 'off',
      'no-mixed-requires': 'error',
      'no-multi-assign': 'off',
      'no-multi-spaces': [
        'error',
        {
          ignoreEOLComments: true,
          exceptions: { Property: true, VariableDeclarator: true, ImportDeclaration: true }
        }
      ],
      'no-multi-str': 'error',
      'no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxBOF: 0,
          maxEOF: 1
        }
      ],
      'no-native-reassign': 'error',
      'no-negated-condition': 'off',
      'no-negated-in-lhs': 'error',
      'no-nested-ternary': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-object': 'error',
      'no-new-require': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'off',
      'no-path-concat': 'error',
      'no-plusplus': 'off',
      'no-process-env': 'off',
      'no-process-exit': 'off',
      'no-proto': 'error',
      'no-prototype-builtins': 'error',
      'no-restricted-globals': ['error', 'toString'],
      'no-restricted-imports': 'error',
      'no-restricted-modules': 'error',
      'no-restricted-properties': 'error',
      'no-restricted-syntax': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-shadow-restricted-names': 'error',
      'no-spaced-func': 'error',
      'no-sync': 'off',
      'no-tabs': 'error',
      'no-template-curly-in-string': 'error',
      'no-ternary': 'off',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-use-before-define': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'off',
      'no-var': 'error',
      'no-void': 'error',
      'no-warning-comments': 'off',
      'no-whitespace-before-property': 'error',
      'no-with': 'error',
      'object-curly-spacing': ['error', 'always'],
      'object-curly-newline': ['error', {                                                             // https://github.com/Losant/eslint-config-losant/pull/4
        ObjectExpression: { minProperties: 6, multiline: true, consistent: true },
        ObjectPattern: { minProperties: 6, multiline: true, consistent: true }
      }],
      'object-property-newline': ['error', {                                                          // https://github.com/Losant/eslint-config-losant/pull/4
        allowMultiplePropertiesPerLine: true
      }],
      'object-shorthand': 'off',
      'one-var': 'off',
      'one-var-declaration-per-line': 'off',
      'operator-assignment': 'off',
      'operator-linebreak': 'off',
      'padded-blocks': 'off',
      'prefer-arrow-callback': 'off',
      'prefer-const': [
        'error',
        {
          ignoreReadBeforeAssign: true
        }
      ],
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: false
        }
      ],
      'prefer-numeric-literals': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-reflect': 'off',
      'prefer-rest-params': 'error',
      'prefer-spread': 'off',
      'prefer-template': 'error',
      'quote-props': [                                                                                // https://github.com/Losant/eslint-config-losant/pull/12
        'warn',
        'consistent-as-needed',
        {
          keywords: false
        }
      ],
      'quotes': [                                                                                     // https://github.com/Losant/eslint-config-losant/pull/12
        'warn',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false
        }
      ],
      'radix': 'error',
      'require-atomic-updates': 'off',
      'require-await': 'off',
      'require-jsdoc': 'off',
      'rest-spread-spacing': [
        'error',
        'never'
      ],
      'semi': 'error',
      'semi-spacing': [
        'error',
        {
          after: true,
          before: false
        }
      ],
      'sort-imports': 'off',
      'sort-keys': 'off',
      'sort-vars': 'off',
      'space-before-blocks': 'error',
      'space-before-function-paren': [                                                                // https://github.com/Losant/eslint-config-losant/pull/18
        'error',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always'
        }
      ],
      'space-in-parens': 'off',
      'space-infix-ops': 'off',
      'space-unary-ops': [
        'error',
        {
          nonwords: false,
          words: false
        }
      ],
      'spaced-comment': 'off',
      'strict': 'error',
      'symbol-description': 'error',
      'template-curly-spacing': 'error',
      'template-tag-spacing': 'error',
      'unicode-bom': [
        'error',
        'never'
      ],
      'valid-jsdoc': 'error',
      'vars-on-top': 'off',
      'wrap-iife': 'error',
      'wrap-regex': 'error',
      'yield-star-spacing': 'error',
      'yoda': 'off',
    //   'import/no-unresolved': ['error', {                                                             // https://github.com/Losant/eslint-config-losant/pull/13
    //     caseSensitive: true,
    //     commonjs: true
    //   }],
    //   'import/extensions': ['warn', 'never', {
    //     json: 'always'
    //   }],
    //   'import/no-extraneous-dependencies': 'error',                                                   // https://github.com/Losant/eslint-config-losant/pull/14
    //   'no-only-tests/no-only-tests': 'error'
    }
  };