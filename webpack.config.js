const path = require('path');
module.exports = {
    target: "node", // Or "async-node"
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [
                    path.resolve(__dirname, 'src')
                ],
                exclude: /node_modules/
            }
        ]
    }
};