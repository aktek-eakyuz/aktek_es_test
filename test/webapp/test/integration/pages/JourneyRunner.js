sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/aktek/test/test/integration/pages/OutgoingList",
	"com/aktek/test/test/integration/pages/OutgoingObjectPage"
], function (JourneyRunner, OutgoingList, OutgoingObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/aktek/test') + '/test/flp.html#app-preview',
        pages: {
			onTheOutgoingList: OutgoingList,
			onTheOutgoingObjectPage: OutgoingObjectPage
        },
        async: true
    });

    return runner;
});

