module.exports = {
    "extends": "standard",
    "env": {
        "node": true,
        "mocha": true
    },
    
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double", { "avoidEscape": true }],
        "jsx-quotes": ["error", "prefer-double"],
        "space-before-function-paren": ["error", "never"],
        "indent": ["error", "tab"],
        "no-tabs": "off",
        "one-var": "off",
        "no-useless-escape": "warn",
        "no-extra-boolean-cast": "off",
        "no-template-curly-in-string": "off"
    }
};