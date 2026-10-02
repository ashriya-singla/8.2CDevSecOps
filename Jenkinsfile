pipeline {
    agent any
    options { skipDefaultCheckout(true); timestamps(); disableConcurrentBuilds() }
    triggers { pollSCM('H/2 * * * *') }
    parameters {
        string(name: 'NODE_BIN', defaultValue: '/Users/siddhantsharma/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin', description: 'Node.js and npm directory on this Jenkins agent')
        booleanParam(name: 'RUN_SONARCLOUD', defaultValue: false, description: 'Enable after configuring project and SONAR_TOKEN credential')
        string(name: 'SONAR_PROJECT_KEY', defaultValue: '', description: 'Actual SonarCloud project key')
        string(name: 'SONAR_ORGANIZATION', defaultValue: '', description: 'Actual SonarCloud organization key')
        string(name: 'SCANNER_ZIP_URL', defaultValue: '', description: 'Official SonarScanner CLI ZIP URL from binaries.sonarsource.com, for this agent platform')
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ashriya-singla/8.2CDevSecOps.git'
                sh 'mkdir -p evidence; rm -f evidence/*.log evidence/*.status'
            }
        }
        stage('Install Dependencies') {
            steps {
                withEnv(["PATH+NODE=${params.NODE_BIN}"]) {
                    sh 'node --version; npm --version; npm install > evidence/install.log 2>&1 || { cat evidence/install.log; exit 1; }; cat evidence/install.log'
                }
            }
        }
        stage('Run Tests') {
            steps {
                withEnv(["PATH+NODE=${params.NODE_BIN}"]) {
                    sh 'set +e; npm test > evidence/tests.log 2>&1; result=$?; cat evidence/tests.log; echo "$result" > evidence/tests.status; echo "Test exit status: $result (continued for demonstration)"; exit 0'
                }
            }
        }
        stage('Generate Coverage Report') {
            steps {
                withEnv(["PATH+NODE=${params.NODE_BIN}"]) {
                    sh 'set +e; npm run coverage > evidence/coverage.log 2>&1; result=$?; cat evidence/coverage.log; echo "$result" > evidence/coverage.status; echo "Coverage exit status: $result (continued for demonstration)"; exit 0'
                }
            }
        }
        stage('NPM Audit (Security Scan)') {
            steps {
                withEnv(["PATH+NODE=${params.NODE_BIN}"]) {
                    sh 'set +e; npm audit > evidence/audit.log 2>&1; result=$?; cat evidence/audit.log; echo "$result" > evidence/audit.status; echo "Audit exit status: $result (vulnerabilities expected in this sample)"; exit 0'
                }
            }
        }
        stage('SonarCloud Analysis') {
            when { expression { params.RUN_SONARCLOUD } }
            steps {
                script {
                    if (!params.SONAR_PROJECT_KEY.trim() || !params.SONAR_ORGANIZATION.trim()) {
                        error('Set the actual SonarCloud project and organization keys.')
                    }
                    if (!params.SCANNER_ZIP_URL.startsWith('https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/') || !params.SCANNER_ZIP_URL.endsWith('.zip')) {
                        error('Select an official SonarScanner CLI ZIP download for this agent.')
                    }
                }
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    withEnv(["SCANNER_ZIP_URL=${params.SCANNER_ZIP_URL}", "SONAR_PROJECT_KEY=${params.SONAR_PROJECT_KEY}", "SONAR_ORGANIZATION=${params.SONAR_ORGANIZATION}"]) {
                        sh '''
                            set +x
                            mkdir -p .scanner-cli
                            curl --fail --location "$SCANNER_ZIP_URL" -o .scanner-cli/scanner.zip
                            unzip -qo .scanner-cli/scanner.zip -d .scanner-cli
                            scanner=$(find .scanner-cli -type f -path '*/bin/sonar-scanner' | head -n 1)
                            test -n "$scanner"
                            "$scanner" -Dsonar.projectKey="$SONAR_PROJECT_KEY" -Dsonar.organization="$SONAR_ORGANIZATION"
                        '''
                    }
                }
            }
        }
    }
    post {
        always { archiveArtifacts artifacts: 'evidence/*,coverage/lcov.info,.scannerwork/report-task.txt', allowEmptyArchive: true }
    }
}
