module.exports = {
    preset: 'react-native',
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@testing-library/react-native)',
    ],
};
