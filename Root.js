﻿exports.newRoot = function newRoot() {

    /* This is the Execution Datetime */

    global.EXECUTION_DATETIME = new Date();

    /* Time Periods Definitions. */

    global.marketFilesPeriods =
        '[' +
        '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
        '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
        '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
        '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
        '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
        '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
        '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
        '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

    global.marketFilesPeriods = JSON.parse(global.marketFilesPeriods);

    global.dailyFilePeriods =
        '[' +
        '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
        '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
        '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
        '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
        '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
        '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
        '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
        '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
        '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
        '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
        '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

    global.dailyFilePeriods = JSON.parse(global.dailyFilePeriods);

    const ROOT_DIR = './';
    const MODULE_NAME = "Root";
    const WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START = 10000 // This avoid a race condition that could happen if one process finished before all the other even started.

    let thisObject = {
        initialize: initialize,
        start: start
    }

    const FULL_LOG = true;

    let logDisplace = "Task Server" + "                                              ";

    return thisObject;

    function initialize(callBackFunction) {

        try {
            console.log(logDisplace  + "Root : [INFO] initialize -> Entering function. ");

            /* Global control of logging. */

            global.LOG_CONTROL = {
                "Assistant": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Exchange API": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Status Report": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Dataset": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Context": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Process Execution Events": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                },
                "Process Output": {
                    logInfo: true,
                    logWarnings: false,
                    logErrors: true,
                    logContent: false,
                    intensiveLogging: false
                }
            };

            callBackFunction();

        }
        catch (err) {
            console.log(logDisplace  + "Root : [ERROR] initialize -> err = " + err.stack);
            return;
        }
    }

    function start(processIndex) {

        try {

            /* Now we will run according to what we see at the config file. */

            /* Small Function to fix numbers into strings in a cool way. */

            function pad(str, max) {
                str = str.toString();
                return str.length < max ? pad("0" + str, max) : str;
            }

            /* Process Loops Declarations. */

            const INDICATOR_BOT_MAIN_LOOP_MODULE = require('./IndicatorBotProcessMainLoop');
            const SENSOR_BOT_MAIN_LOOP_MODULE = require('./SensorBotProcessMainLoop');
            const TRADING_ENGINE_MAIN_LOOP_MODULE = require('./TradingBotProcessMainLoop');

            let botConfig;
            let processInstance = global.TASK_NODE.bot.processes[processIndex]

            /* Some very basic validations that we have all the information needed. */
            if (processInstance.referenceParent === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Process Instance without Reference Parent. Process Instance = " + JSON.stringify(processInstance));
                global.EXIT_NODE_PROCESS()
                return
            }

            if (processInstance.referenceParent.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Process Definition witn no codeName defined. Process Definition = " + JSON.stringify(processInstance.referenceParent));
                global.EXIT_NODE_PROCESS()
                return
            }

            if (processInstance.referenceParent.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Process Definition not attached to a Bot Definition. Process Definition = " + JSON.stringify(processInstance.referenceParent));
                global.EXIT_NODE_PROCESS()
                return
            }

            if (processInstance.referenceParent.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Bot Definition witn no codeName defined. Bot Definition = " + JSON.stringify(processInstance.referenceParent.parentNode));
                global.EXIT_NODE_PROCESS()
                return
            }

            if (processInstance.referenceParent.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Bot Definition not attached to a Team. Bot Definition = " + JSON.stringify(processInstance.referenceParent.parentNode));
                global.EXIT_NODE_PROCESS()
                return
            }

            if (processInstance.referenceParent.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] start-> Team witn no codeName defined. Team = " + JSON.stringify(processInstance.referenceParent.parentNode.parentNode));
                global.EXIT_NODE_PROCESS()
                return
            }

            /* Here we will check if we need to load the configuration and code of the bot from a file or we will take that from the UI. */
            if (processInstance.referenceParent.code.framework !== undefined) {
                botConfig = processInstance.referenceParent.parentNode.code
                botConfig.definedByUI = true
                bootingBot(processIndex)
                return
            } else {
                getBotConfigFromFile();
                return
            }           

            function getBotConfigFromFile() {

                try {
                    console.log(logDisplace + "Root : [INFO] start -> getBotConfigFromFile -> Entering function. ");

                    const FILE_STORAGE = require('./FileStorage.js');
                    let fileStorage = FILE_STORAGE.newFileStorage();

                    let filePath = global.TASK_NODE.bot.code.team + '/bots/' + global.TASK_NODE.bot.code.repo + '/this.bot.config.json';

                    fileStorage.getTextFile(global.TASK_NODE.bot.code.team, filePath, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> filePath = " + filePath);
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> team = " + global.TASK_NODE.bot.code.team);
                            return;
                        }

                        try {
                            botConfig = JSON.parse(text);
                            botConfig.repo = global.TASK_NODE.bot.code.repo;
                            bootingBot(processIndex);
                        } catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> onInizialized -> onFileReceived -> err = " + JSON.stringify(err));
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Root : [ERROR] start -> getBotConfigFromFile -> err = " + err.stack);
                    return;
                }
            }

            function bootingBot(processIndex) {

                try {
                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> Entering function. "); }

                    botConfig.process = global.TASK_NODE.bot.processes[processIndex].referenceParent.code.codeName
                    botConfig.debug = {};
                    botConfig.processNode = global.TASK_NODE.bot.processes[processIndex]

                    /* Simplifying the access to basic info */
                    botConfig.devTeam = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.code.codeName

                    /* This stuff is still hardcoded and unresolved. */
                    botConfig.version = {
                        "major": 1,
                        "minor": 0
                    }
                    botConfig.dataSetVersion = "dataSet.V1"

                    /* Loop Counter */
                    botConfig.loopCounter = 0;                   

                    /* File Path Root */
                    botConfig.filePathRoot = botConfig.devTeam + "/" + botConfig.codeName + "." + botConfig.version.major + "." + botConfig.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + botConfig.dataSetVersion;

                    /* Process Key */
                    botConfig.processKey = global.TASK_NODE.bot.processes[processIndex].name + '-' + global.TASK_NODE.bot.processes[processIndex].type + '-' + global.TASK_NODE.bot.processes[processIndex].id

                    /* Bot Type */
                    botConfig.type = global.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type

                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> filePathRoot = " + botConfig.filePathRoot); }
                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> Process found at the bot configuration file. -> process = " + global.TASK_NODE.bot.processes[processIndex].referenceParent.code.codeName); }

                    let processConfig = global.TASK_NODE.bot.processes[processIndex].referenceParent.code

                    if (processConfig.framework !== undefined) {
                        if (processConfig.framework.name === "Multi-Period-Daily" || processConfig.framework.name === "Multi-Period-Market" || processConfig.framework.name === "Multi-Period") {
                            processConfig.framework.startDate.resumeExecution = true;
                            if (processConfig.startMode.noTime !== undefined) {
                                if (processConfig.startMode.noTime.run === "true") {
                                    if (processConfig.startMode.noTime.beginDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = processConfig.startMode.noTime.beginDatetime;
                                        processConfig.framework.startDate.resumeExecution = true;
                                    }
                                }
                            }
                            if (processConfig.startMode.userDefined !== undefined) {
                                if (processConfig.startMode.userDefined.run === "true") {
                                    if (processConfig.startMode.userDefined.beginDatetime !== undefined) {
                                        processConfig.framework.startDate.fixedDate = processConfig.startMode.userDefined.beginDatetime;
                                        processConfig.framework.startDate.resumeExecution = processConfig.startMode.userDefined.resumeExecution;
                                    }
                                }
                            }
                        }
                    }

                    try {

                        /* We test each type of start Mode to get what to run and how. */

                        if (processConfig.startMode.allMonths !== undefined) {

                            if (processConfig.startMode.allMonths.run === "true") {

                                if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> allMonths start mode detected. "); }

                                for (let year = processConfig.startMode.allMonths.maxYear; year >= processConfig.startMode.allMonths.minYear; year--) {

                                    for (let month = 12; month > 0; month--) {

                                        let padMonth = pad(month, 2)

                                        let newInstanceBotConfig = JSON.parse(JSON.stringify(botConfig));

                                        newInstanceBotConfig.debug = {
                                            month: pad(month, 2),
                                            year: pad(year, 4)
                                        };

                                        let timeDelay = Math.random() * 10 * 1000; // We introduce a short delay so as to not overload the machine.
                                        setTimeout(startProcess, timeDelay);

                                        function startProcess() {

                                            if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> startProcess -> Ready to start process."); }

                                            switch (botConfig.type) {
                                                case 'Sensor Bot': {
                                                    runSensorBot(newInstanceBotConfig, processConfig, padMonth, year);
                                                    break;
                                                }
                                                case 'Indicator Bot': {
                                                    runIndicatorBot(newInstanceBotConfig, processConfig, padMonth, year);
                                                    break;
                                                }
                                                default: {
                                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.oneMonth !== undefined) {

                            if (processConfig.startMode.oneMonth.run === "true") {

                                if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> oneMonth start mode detected. "); }

                                startProcess();

                                function startProcess() {

                                    if (FULL_LOG === true) { console.log(logDisplace + "Root : [INFO] start -> bootingBot -> startProcess -> Ready to start process."); }

                                    let month = pad(processConfig.startMode.oneMonth.month, 2);
                                    let year = processConfig.startMode.oneMonth.year;

                                    botConfig.debug = {
                                        month: pad(month, 2),
                                        year: pad(year, 4)
                                    };

                                    switch (botConfig.type) {
                                        case 'Sensor Bot': {
                                            runSensorBot(botConfig, processConfig, month, year);
                                            break;
                                        }
                                        case 'Indicator Bot': {
                                            runIndicatorBot(botConfig, processConfig, month, year);
                                            break;
                                        }
                                        default: {
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> startProcess -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                        }
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.noTime !== undefined) {

                            if (processConfig.startMode.noTime.run === "true") {

                                let month = pad((new Date()).getUTCMonth() + 1, 2);
                                let year = (new Date()).getUTCFullYear();

                                if (processConfig.startMode.noTime.resumeExecution === true) {
                                    botConfig.hasTheBotJustStarted = false;
                                } else {
                                    botConfig.hasTheBotJustStarted = true;
                                }

                                switch (botConfig.type) {
                                    case 'Sensor Bot': {
                                        runSensorBot(botConfig, processConfig, month, year);
                                        break;
                                    }
                                    case 'Indicator Bot': {
                                        runIndicatorBot(botConfig, processConfig, month, year);
                                        break;
                                    }
                                    case 'Trading Bot': {
                                        runTradingBot(botConfig, processConfig);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.fixedInterval !== undefined) {

                            if (processConfig.startMode.fixedInterval.run === "true") {

                                botConfig.runAtFixedInterval = true;
                                botConfig.fixedInterval = processConfig.startMode.fixedInterval.interval;

                                let month = pad((new Date()).getUTCMonth() + 1, 2);
                                let year = (new Date()).getUTCFullYear();

                                switch (botConfig.type) {
                                    case 'Sensor Bot': {
                                        runSensorBot(botConfig, processConfig, month, year);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                        if (processConfig.startMode.userDefined !== undefined) {

                            if (processConfig.startMode.userDefined.run === "true") {

                                botConfig.startMode = "User Defined";
                                console.log(logDisplace + "Root : [INFO] start -> bootingBot -> Process found at the bot configuration file. -> Start Mode = " + botConfig.startMode);

                                let month = pad((new Date()).getUTCMonth() + 1, 2);
                                let year = (new Date()).getUTCFullYear();

                                if (processConfig.startMode.userDefined.resumeExecution === true) {
                                    botConfig.hasTheBotJustStarted = false;
                                } else {
                                    botConfig.hasTheBotJustStarted = true;
                                }

                                switch (botConfig.type) {
                                    case 'Trading Bot': {
                                        runTradingBot(botConfig, processConfig);
                                        break;
                                    }
                                    default: {
                                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected bot type. -> botConfig.type = " + botConfig.type);
                                    }
                                }
                            }
                        }

                    } catch (err) {
                        console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> Unexpected exception. -> err = " + err.stack);
                    }


                    function runSensorBot(pBotConfig, pProcessConfig, pMonth, pYear) {

                        try {
                            global.TOTAL_PROCESS_INSTANCES_CREATED++

                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> Entering function."); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> pMonth = " + pMonth); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> pYear = " + pYear); }

                            let extractionBotMainLoop = SENSOR_BOT_MAIN_LOOP_MODULE.newSensorBotProcessMainLoop(pBotConfig, logger);
                            extractionBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    extractionBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;
                                        if (pYear !== undefined) {
                                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                                        } else {
                                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                                        }

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> Bot will not be started. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> onInitializeReady -> err = " + err.message);

                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runSensorBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }

                    function runIndicatorBot(pBotConfig, pProcessConfig, pMonth, pYear) {

                        try {
                            global.TOTAL_PROCESS_INSTANCES_CREATED++

                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> Entering function."); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> pMonth = " + pMonth); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> pYear = " + pYear); }

                            let indicatorBotMainLoop = INDICATOR_BOT_MAIN_LOOP_MODULE.newIndicatorBotProcessMainLoop(pBotConfig, logger);
                            indicatorBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    indicatorBotMainLoop.run(pMonth, pYear, whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;
                                        if (pYear !== undefined) {
                                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process + "." + pYear + "." + pMonth;
                                        } else {
                                            botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;
                                        }

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> Failed to initialize the bot. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> onInitializeReady -> err = " + err.message);
                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runIndicatorBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }

                    function runTradingBot(pBotConfig, pProcessConfig) {

                        global.TOTAL_PROCESS_INSTANCES_CREATED++

                        try {
                            const DEBUG_MODULE = require(ROOT_DIR + 'DebugLog');
                            let logger;

                            logger = DEBUG_MODULE.newDebugLog();
                            logger.bot = pBotConfig;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> Entering function."); }

                            let tradingBotMainLoop = TRADING_ENGINE_MAIN_LOOP_MODULE.newTradingBotProcessMainLoop(pBotConfig, logger);
                            tradingBotMainLoop.initialize(pProcessConfig, onInitializeReady);

                            function onInitializeReady(err) {

                                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                    tradingBotMainLoop.run(whenRunFinishes);

                                    function whenRunFinishes(err) {

                                        pBotConfig.loopCounter = 0;

                                        let botId;

                                        botId = pBotConfig.devTeam + "." + pBotConfig.codeName + "." + pBotConfig.process;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.write(MODULE_NAME, "[INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> botId = " + botId);
                                            console.log(logDisplace + "Root : [INFO] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished sucessfully.");
                                            logger.persist();

                                        } else {

                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bye.");
                                            logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> whenStartFinishes -> Bot execution finished with errors. Please check the logs.");
                                            logger.persist();
                                        }
                                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                    }

                                } else {
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> err = " + err.message);
                                    logger.write(MODULE_NAME, "[ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> Failed to initialize the bot. ");
                                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> onInitializeReady -> err = " + err.message);
                                    logger.persist();
                                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                                }
                            }
                        }
                        catch (err) {
                            console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> runTradingBot -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
                catch (err) {
                    console.log(logDisplace + "Root : [ERROR] start -> bootingBot -> err = " + err.stack);
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function exitProcessInstance() {

                global.ENDED_PROCESSES_COUNTER++
                console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> exitProcessInstance -> Process #" + global.ENDED_PROCESSES_COUNTER + " from " + global.TOTAL_PROCESS_INSTANCES_CREATED + " exiting.");

                if (global.ENDED_PROCESSES_COUNTER === global.TOTAL_PROCESS_INSTANCES_CREATED) {
                    global.EXIT_NODE_PROCESS()
                }
            }
        } catch (err) {
            console.log("[ERROR] Task Server -> " + global.TASK_NODE.name + " -> Root -> Start -> Err = " + err.stack);
        }
    }
}




