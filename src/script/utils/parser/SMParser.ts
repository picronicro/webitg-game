import {readChartFile} from "./modules/readChartFile.ts";
import ChartSM, {BPMs, DynamicDispBPM, Stops, templateChart} from "../../simfileObjects/sm.ts";

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

    multilinedTag: Array<string> = [];
    parsingMultilined: MultilinedTags = MultilinedTags.NONE;

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

        lines.forEach(line => {
            this.parseMultilinedTag(line);

            if (this.regexTag.test(line)) {
                const parsedTag: Array<string> = line.replace(this.regexExtractSimpleTag, "")
                    .split(":");

                const property = parsedTag[0].toLowerCase();
                if (this.hasProperty(this.parsedJson.header, property)) {
                    switch (property) {
                        case "bpms":
                            this.checkIfMultilined(line, parsedTag, MultilinedTags.BPMS);
                            break;
                        case "stops":
                            this.checkIfMultilined(line, parsedTag, MultilinedTags.STOPS);
                            break;
                        case "displaybpm":
                            this.parsedJson.header[property] = this.parseDisplayBPM(parsedTag);
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

    private parseBPMsOrStops(tag: Array<string>, type: MultilinedTags): Array<BPMs> {
        console.warn("Parsing BPMs/Stops...");

        const parsedValues: Array<BPMs> = [];
        let obj: any
        switch (type) {
            case MultilinedTags.BPMS:
                obj = <BPMs> {beat: 0, bpm: 0};
                break;
            case MultilinedTags.STOPS:
                obj = <Stops> {beat: 0, seconds: 0}
        }

        const values = tag[1].split(",");
        values.forEach(value => {
            const keys = Object.keys(obj);
            const parsed = value.split("=");

            obj[keys[0]] = parseFloat(parsed[0]);
            obj[keys[1]] = parseFloat(parsed[1]);
            parsedValues.push(structuredClone(obj))
        });

        return parsedValues;
    }

    private parseDisplayBPM(value: Array<string>): number | DynamicDispBPM  {
        // just single int value is static bpm
        // value, like 100:200 is the range between bpms
        // asterisk is unknown (...)
        console.warn("Parsing Display BPM...");

        if (value.length === 3) { // bpm range
            return <DynamicDispBPM>{
                from: Number(value[1]),
                to: Number(value[2]),
            };
        } else {
            if (isNaN(Number(value[1]))) { // undefined bpm
                return -1;
            } else { // static bpm
                return Number(value[1]);
            }
        }
    }

    private parseNotes(){

    }

    // misc
    // Prettier way to check property
    private hasProperty(obj: any, property: string): boolean {
        return Object.prototype.hasOwnProperty.call(obj, property)
    }

    // Parse multilined tags, such as bpms, stops...
    private parseMultilinedTag(line: string) {
        if (this.parsingMultilined !== MultilinedTags.NONE) {
            this.multilinedTag.push(line);
            if (line.includes(";")) {
                // eslint-disable-next-line no-case-declarations
                const tag = this.multilinedTag.join("").replace(this.regexExtractSimpleTag, "")
                    .split(":");

                switch (this.parsingMultilined) {
                    case MultilinedTags.BPMS:
                        this.parsedJson.header["bpms"] = this.parseBPMsOrStops(tag, MultilinedTags.BPMS);
                        break;
                    case MultilinedTags.STOPS:
                        this.parsedJson.header["stops"] = this.parseBPMsOrStops(tag, MultilinedTags.STOPS);
                        break;
                }

                this.multilinedTag = []
                this.parsingMultilined = MultilinedTags.NONE;
            }
        }
    }

    // Check that line is multilined
    private checkIfMultilined(line: string, parsedTag: Array<string>, tagType: MultilinedTags) {
        let property: string = ""
        switch (tagType) {
            case MultilinedTags.BPMS:
                property = "bpms";
                break;
            case MultilinedTags.STOPS:
                property = "stops";
        }

        if (line.includes(";")) {
            this.parsedJson.header[property] = this.parseBPMsOrStops(parsedTag, tagType);
        } else {
            this.parsingMultilined = tagType;
            this.multilinedTag.push(line);
        }
    }

}