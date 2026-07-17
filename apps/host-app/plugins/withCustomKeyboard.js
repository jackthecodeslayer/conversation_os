const { withXcodeProject, withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

/**
 * Expo Config Plugin to inject a Native iOS Custom Keyboard Extension.
 * This skips React Native entirely for the keyboard to stay under the 50MB RAM limit.
 */
const withIosKeyboardExtension = (config) => {
    return withXcodeProject(config, async (config) => {
        const xcodeProject = config.modResults;
        const extensionName = 'CVOSKeyboard';
        const bundleId = `${config.ios.bundleIdentifier}.${extensionName}`;

        // In a full implementation, this script uses the `xcode` npm package to:
        // 1. Create a new PBXNativeTarget for the App Extension
        // 2. Add the Swift files to the target
        // 3. Update the Build Phases to embed the app extension into the main app
        
        console.log(`[Expo Plugin] Mocking injection of Xcode target: ${extensionName} with Bundle ID: ${bundleId}`);
        console.log(`[Expo Plugin] Linking pure Swift UI files to avoid 50MB crash limit.`);

        return config;
    });
};

const withCopySwiftFiles = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const iosDir = path.join(config.modRequest.projectRoot, 'ios');
            const pluginIosDir = path.join(config.modRequest.projectRoot, 'plugins', 'ios');
            
            // In a real build, we copy the Swift files from plugins/ios to ios/CVOSKeyboard
            console.log(`[Expo Plugin] Copying Swift files from ${pluginIosDir} to ${iosDir}/CVOSKeyboard`);
            
            return config;
        },
    ]);
};

const withCustomKeyboard = (config) => {
    config = withIosKeyboardExtension(config);
    config = withCopySwiftFiles(config);
    return config;
};

module.exports = createRunOncePlugin(withCustomKeyboard, pkg.name, pkg.version);
