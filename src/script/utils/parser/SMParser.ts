import {readChartFile} from "./modules/readChartFile.ts";
import ChartSM, {BPMs, templateChart} from "../../simfileObjects/sm.ts";

enum MultilinedTags {
    NONE = -1,
    BPMS,
    STOPS
}

export default class SMParser {

    // This regex is used for matching Header tag lines. Skips empty tags
    private readonly regexTag: RegExp = /#([^:]+):([^;]+)/;
    // This regex is used to only leave tag name and its value
    private readonly regexExtractSimpleTag: RegExp = /[#;\r]/g;

    private rawSim: string | undefined;

    private parsedJson: ChartSM | {[index: string]: any} = structuredClone(templateChart)

    constructor(file: File) {
        readChartFile(file)
            .then(value => {
                this.rawSim = value;
                console.warn("File read")

                if (this.rawSim !== undefined) {
                    this.parseTags()
                } else {
                    console.error("Unable to parse chart! File is undefined.");
                }
            })
            .catch(err => console.log(err));
    }

    private parseTags() {
        // @ts-expect-error File may be undefined
        const lines = this.rawSim.split('\n');

        const multilinedTag: Array<string> = [];
        let parsingMultilined: MultilinedTags = MultilinedTags.NONE;

        lines.forEach(line => {
            // parse multilined tags, such as bpms, stops...
            if (parsingMultilined !== MultilinedTags.NONE) {
                multilinedTag.push(line);
                if (line.includes(";")) {
                    switch (parsingMultilined) {
                        case MultilinedTags.BPMS:
                            // eslint-disable-next-line no-case-declarations
                            const tag = multilinedTag.join("").replace(this.regexExtractSimpleTag, "")
                                .split(":");
                            this.parsedJson.header["bpms"] = this.parseBPMs(tag);
                            break;
                        case MultilinedTags.STOPS:
                            break;
                    }

                    parsingMultilined = MultilinedTags.NONE;
                }
            }

            if (this.regexTag.test(line)) {
                const parsedTag = line.replace(this.regexExtractSimpleTag, "")
                    .split(":");

                const property = parsedTag[0].toLowerCase();
                if (this.hasProperty(this.parsedJson.header, property)) {
                    switch (property) {
                        case "bpms":
                            if (line.includes(";")) {
                                this.parsedJson.header[property] = this.parseBPMs(parsedTag);
                            } else {
                                parsingMultilined = MultilinedTags.BPMS;
                                multilinedTag.push(line);
                            }

                            break;
                        case "displaybpm":
                            break;
                        case "notes":
                            break;
                        default:
                            // data type correction
                            if (typeof this.parsedJson.header[property] === "number") {
                                this.parsedJson.header[property] = parseFloat(parsedTag[1])
                            } else {
                                this.parsedJson.header[property] = parsedTag[1]
                            }
                    }
                }
            }
        });

        console.log(this.parsedJson);
    }

    private parseBPMs(tag: Array<string>): Array<BPMs> {
        console.warn("Parsing BPMs...");
        console.log(tag[1]);

        const parsedValues: Array<BPMs> = [];

        const values = tag[1].split(",");
        values.forEach(value => {
            const obj: BPMs = {beat: 0, bpm: 0};
            const parsed = value.split("=");

            obj.beat = parseFloat(parsed[0]);
            obj.bpm = parseFloat(parsed[1]);
            parsedValues.push(obj)
        });
        return parsedValues;



        // const obj: BPMs = {beat: 0, bpm: 0};
        // const singleValue = tag[1].split("=");
        //
        // obj.beat = parseFloat(singleValue[0]);
        // obj.bpm = parseFloat(singleValue[1]);
        // return obj;
    }

    private parseDisplayBPM() {
        // just single int value is static bpm
        // value, like 100:200 is the range between bpms
        // asterisk is unknown (...)
    }

    private parseNotes() {

    }

    // misc
    // Prettier way to check property
    private hasProperty(obj: any, property: string): boolean {
        return Object.prototype.hasOwnProperty.call(obj, property)
    }

}