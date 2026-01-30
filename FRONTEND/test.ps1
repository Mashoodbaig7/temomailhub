$env:NODE_OPTIONS = '--openssl-legacy-provider'
node 'node_modules/react-app-rewired/bin/index.js' test --watchAll=false