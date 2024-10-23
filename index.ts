// import definePlugin from "@utils/types";
//import { definePluginSettings } from "@vencord/types/api/settings";
import definePlugin, { OptionType } from "@vencord/types/utils/types";

export default definePlugin({
    name: "hideUser",
    description: "This hides a user like friend from DM's and friends page",
    authors: [{
        name: "SpiderUnderUrBed",
        id: 0n
    }],

    patches: [],
    start() {
        console.log(this.name, "just started");

    },
    stop() {

    },
});