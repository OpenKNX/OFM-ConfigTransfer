// eslint.config.js
import js from "@eslint/js";
// import stylistic from '@stylistic/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
    // config-presets:
    // stylisticJs.configs['recommended-flat'],
    // stylisticJs.configs['all-flat'],
    /*
    stylistic.configs.customize({
        indent: 4,
        // quotes: 'single',
        // quotes: ["error", "double", {"avoidEscape": true}],
        semi: true,
        jsx: false,
        // ...
    }),
    */

    // predefined configurations @see eslint documentation
    js.configs.recommended,
    // js.configs.all,

    {
        plugins: {
            '@stylistic/js': stylisticJs
        },
        languageOptions: {
            ecmaVersion: 3,
            sourceType: "script"
        },
        rules: {
            // 0 disabled, 1="warn", 2="error"
            // semi: "error",
            // "prefer-const": "error",
            // "for-direction": "error",
            "no-undef": 1,
            "no-unused-vars": 1,
            "no-redeclare": 1,

            // individual:
            "capitalized-comments": 0,

            "complexity": 1,
            "max-depth": 1,
            "max-lines-per-function": 1,
            "max-nested-callbacks": ["error", 3],
            "max-statements": ["warn", 20],

            "curly": 2,


            // modified for ets:
            "no-var": 0, // const not available in ETS!
            "no-magic-numbers": 0, // const not available in ETS!
            "eqeqeq": 0, // not available in ETS? TODO check again!
            "max-params": 1, // ets api needs 4 parameters; TODO check configuration

            "@stylistic/js/array-bracket-newline": ["warn", "consistent"],
            "@stylistic/js/array-bracket-spacing": 2,
            "@stylistic/js/array-element-newline": ["warn", "consistent"],
            "@stylistic/js/block-spacing": 2,
            "@stylistic/js/brace-style": 2,
            "@stylistic/js/comma-dangle": ["error", "never"], // important! TODO relly required for ES v3?
            "@stylistic/js/comma-spacing": 2,
            "@stylistic/js/comma-style": 2,
            "@stylistic/js/computed-property-spacing": 2,
            // "@stylistic/js/eol-location": ...
            "@stylistic/js/eol-last": 2,
            "@stylistic/js/function-call-spacing": 2,
            "@stylistic/js/function-paren-newline": ["error", "never"],
            "@stylistic/js/indent": ["error", 4],
            "@stylistic/js/key-spacing": 2,
            "@stylistic/js/keyword-spacing": 2,
            // "@stylistic/js/line-comment-position": ...,
            // TODO check "@stylistic/js/linebreak-style": ["warn", "windows"],
            "@stylistic/js/max-len": ["warn", {"code":160}],
            // "@stylistic/js/multiline-comment-style": 2,
            // multiline-comment-style
            // multiline-ternary
            // new-parens
            "@stylistic/js/no-confusing-arrow": 2, // should not be relevant in ETS
            // not use "@stylistic/js/no-extra-parens": 1,
            "@stylistic/js/no-extra-semi": 2,
            "@stylistic/js/no-floating-decimal": 2,
            "@stylistic/js/no-mixed-operators": 1,
            "@stylistic/js/no-mixed-spaces-and-tabs": 2,
            "@stylistic/js/no-multi-spaces": ["error", { "ignoreEOLComments": true }],
            "@stylistic/js/no-trailing-spaces": 1,
            // "@stylistic/js/no-multiple-empty-lines": ,
            "@stylistic/js/no-tabs": 2,
            "@stylistic/js/no-trailing-spaces": 2,
            "@stylistic/js/no-whitespace-before-property": 2,
            "@stylistic/js/quote-props": ["error", "always"],
            // TODO check // "@stylistic/js/quotes": ["warn", "double", { avoidEscape: true }],
            "@stylistic/js/semi": ["error", "always"],
            "@stylistic/js/semi-spacing": ["error", {"before":false, "after":true}],
        }
    }
];
