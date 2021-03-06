const IPHistoryInit = require('./iphistory/iphistory.init');
const BinaryPjax    = require('../../../../base/binary_pjax');
const jpClient      = require('../../../../common_functions/country_base').jpClient;

const IPHistory = (() => {
    const onLoad = () => {
        if (jpClient()) {
            BinaryPjax.loadPreviousUrl();
        }
        IPHistoryInit.init();
    };

    const onUnload = () => {
        IPHistoryInit.clean();
    };

    return {
        onLoad,
        onUnload,
    };
})();

module.exports = IPHistory;
