const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const childProcess = spawn(
    path.join(__dirname, 'node_modules', '.bin', 'tsc'),
    [
        '--outDir', path.join(__dirname, 'dist'),
        '--baseUrl', './src',
        '--target', 'es2018',
        '--lib', 'es2020,dom',
        '--module', 'commonjs',
        '--moduleResolution', 'node',
        '--jsx', 'react',
        '--allowSyntheticDefaultImports',
        '--esModuleInterop',
        '--alwaysStrict',
        '--strictNullChecks',
        '--noImplicitThis',
        '--noImplicitReturns',
        '--noUnusedLocals',
        '--declaration',
        '--declarationDir', path.join(__dirname, 'typings'),
        process.argv.includes('--watch') && '--watch',
        'global.d.ts',
        ...fs.readdirSync(path.join(__dirname, 'src'))
            .filter(name => /\.tsx?$/.test(name))
            .map(name => path.join(__dirname, 'src', name))
    ].filter(Boolean),
    { stdio: 'inherit' }
)

childProcess.on('close', () => {
    fs.readdirSync(path.join(__dirname, 'typings'))
        .filter(name => /\.d\.ts?$/.test(name))
        .forEach(name => {
            const filepath = path.join(__dirname, 'typings', name)
            fs.writeFileSync(filepath, '// Type definitions for PostCMS\n// Copyright (c) 2020 postUI Inc.\n\n/// <reference path="../global.d.ts" />\n\n' + fs.readFileSync(filepath).toString())
        })
})
