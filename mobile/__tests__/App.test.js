import React from 'react';
import render from 'react-test-renderer';
import { Linking } from 'react-native';
import App from '../App';

jest.useFakeTimers();

// Mock expo-location
jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
    Accuracy: { High: 3 },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
    StatusBar: (props) => null,
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        expoConfig: {
            hostUri: '192.168.1.1:8081',
        },
    },
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: (props) => <View {...props} testID="mock-webview" />,
        WebView: (props) => <View {...props} testID="mock-webview" />,
    };
});

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

describe('<App />', () => {
    it('renders correctly', async () => {
        let renderer;
        await render.act(async () => {
            renderer = render.create(<App />);
        });

        // Fast-forward timers for syncing state
        await render.act(async () => {
            jest.runAllTimers();
        });

        expect(renderer.toJSON()).toBeDefined();
    });

    it('contains the welcome text', async () => {
        let renderer;
        await render.act(async () => {
            renderer = render.create(<App />);
        });

        const instance = renderer.root;
        // Agri-Growth text should be present in the tree
        const welcomeText = instance.find((node) =>
            node.type === 'Text' && node.props.children === 'Agri-Growth'
        );
        expect(welcomeText).toBeDefined();
    });
});
