
const cts = require("../test/testing.js");



test("UCT constants", () => {
    expect(cts.uctFormatVer).toBe("cv1");
    expect(cts.uctGenVer).toBe("0.1.0");
    expect(cts.uctGen).toBe("uct");

    expect(cts.uctAppId).toBeGreaterThanOrEqual(0);
    expect(cts.uctAppId).toBeLessThanOrEqual(0xFFFF);
    expect(cts.uctAppVer).toBeGreaterThanOrEqual(0);
    expect(cts.uctAppVer).toBeLessThanOrEqual(0xFF);
    
});

describe('Button Handler', () => {
    const device = cts.device;

    const uctBtnExport = cts.uctBtnExport;
    const uctBtnImport = cts.uctBtnImport;
    const uctBtnCopy = cts.uctBtnCopy;
    const uctBtnReset= cts.uctBtnReset;
    
    var online = undefined;
    var progress = undefined;

    describe('Export', () => {
        var context = {
            "p_moduleSelection":"UCTD_ModuleIndex",
            "p_channelSource":"UCTD_Channel",
            "p_exportParamSelectionSelection":"UCTD_Opt1",
            "p_exportFormatSelection":"UCTD_Opt2",
            "p_exportOutput":"UCTD_Output",
        };
        it("includes non-default and allow single or multi-line output", () => {
            uctBtnExport(device, online, progress, context);
            expect(device.getParameterByName("UCTD_Output").value).toBe("OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§;OpenKNX");
    
            var p = device.getParameterByName("CHN_Param2C"); 
            expect(p.value).toBe(500);
            p.value = 400;
            expect(p.value).toBe(400);
    
            device.getParameterByName("UCTD_Channel").value = 2;
            device.getParameterByName("UCTD_Output").value = "";
            device.getParameterByName("UCTD_Opt1").value = 1;
            uctBtnExport(device, online, progress, context);
            expect(device.getParameterByName("UCTD_Output").value).toBe("OpenKNX,cv1,0xAF42:0x23/CHN:0x18/2§Param~C=400§;OpenKNX");
    
            // multi-line format
            device.getParameterByName("UCTD_Opt2").value = 1;
            uctBtnExport(device, online, progress, context);
            expect(device.getParameterByName("UCTD_Output").value).toBe("OpenKNX,cv1,0xAF42:0x23/CHN:0x18/2\nParam~C=400\n;OpenKNX");

            // TODO split: move to separate testcase
            const failingParamGet = {
                getParameterByName: function (name) {
                    // fail on non UCT fields
                    return (name.slice(0,4)=="UCTD") ? device.getParameterByName(name) : undefined;
                },
            };
            expect(() => uctBtnExport(failingParamGet, online, progress, context)).toThrow(Error);
        });
    });

    describe('Import', () => {
        var context = {
            // "p_moduleSelection":"UCTD_ModuleIndex",
            "p_importLine":"UCTD_Import",
            "p_channelTarget":"UCTD_Channel",
            "p_importCheck":"UCTD_ImportCheck",
            "p_messageOutput":"UCTD_Output",
        };

        it("fails on arbitraty string", () => {
            // var device = {};
            device.getParameterByName("UCTD_Channel").value = 3;
            device.getParameterByName("UCTD_Import").value = "WRONG";
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);
        });
    
        it("changes parameters to given or default and show success", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§Param~D=NEU§;OpenKNX";
            device.getParameterByName("CHN_Param3C").value = 20; // non-default value - should be resetted by iport
            device.getParameterByName("CHN_Param3D").value = "ALT"; // shoud be overwritten
            uctBtnImport(device, online, progress, context);
            expect(device.getParameterByName("CHN_Param3C").value).toBe(500); // default value
            expect(device.getParameterByName("CHN_Param3D").value).toBe("NEU"); // from transfer-string
            expect(device.getParameterByName("UCTD_Output").value).toBe("CHN/3 Import [OK]");
        });
    
        it("fails on not existing parameter", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§NOT_EXISTING=EGAL§;OpenKNX";
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);
        });
    
        it("fails on unsupported format version", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv5,0xAF42:0x23/CHN:0x18/3§;OpenKNX";
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);
        });
    
        it("prints outputs and ignores comments", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§>echo1§#comment§>echo 2§;OpenKNX";
            uctBtnImport(device, online, progress, context);
            expect(device.getParameterByName("UCTD_Output").value).toBe(">echo1\n>echo 2");
    
        });
    
        it("fails on unknown command", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv5,0xAF42:0x23/CHN:0x18/3§!unbekannt§;OpenKNX";
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);   
        });
    
        it("fails on missing or incomplete end-marker", () => {
            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§Param~D=NEU"
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);                

            device.getParameterByName("UCTD_Import").value = "OpenKNX,cv1,0xAF42:0x23/CHN:0x18/3§Param~D=NEU§;OpenKN"
            expect(() => uctBtnImport(device, online, progress, context)).toThrow(Error);                
        });
    });

    describe('Copy', () => {
        var context = {
            "p_moduleSelection":"UCTD_ModuleIndex",
            // "p_channelTarget":"UCTD_Channel",
            "p_channelSource":"UCTD_ChannelSource",
            "p_channelTarget":"UCTD_ChannelTarget",
            "p_messageOutput":"UCTD_Output",
        };
        test("regulare copy and success message", () => {
            device.getParameterByName("UCTD_ChannelSource").value = 6;
            device.getParameterByName("UCTD_ChannelTarget").value = 5;
            device.getParameterByName("CHN_Param6D").value = "Kanal6";
            uctBtnCopy(device, online, progress, context);
            expect(device.getParameterByName("UCTD_Output").value).toBe("CHN/6 -> CHN/5 [OK]");
            expect(device.getParameterByName("CHN_Param5D").value).toBe("Kanal6");
        });
    
        it("fails on source==target", () => {
            device.getParameterByName("UCTD_ChannelSource").value = 6;
            device.getParameterByName("UCTD_ChannelTarget").value = 6;
            expect(() => uctBtnCopy(device, online, progress, context)).toThrow(Error);
        });

        it("fails on source out of range", () => {
            device.getParameterByName("UCTD_ChannelSource").value = 99;
            device.getParameterByName("UCTD_ChannelTarget").value = 6;
            expect(() => uctBtnCopy(device, online, progress, context)).toThrow(Error);
        });

        it("fails on target out of range", () => {
            device.getParameterByName("UCTD_ChannelSource").value = 4;
            device.getParameterByName("UCTD_ChannelTarget").value = 99;
            expect(() => uctBtnCopy(device, online, progress, context)).toThrow(Error);
        });
    });

    test("Reset", () => {
        var context = {
            "p_moduleSelection":"UCTD_ModuleIndex",
            "p_channelTarget":"UCTD_Channel",
            "p_messageOutput":"UCTD_Output",
        };
        device.getParameterByName("UCTD_Channel").value = 3;
        uctBtnReset(device, online, progress, context);
        expect(device.getParameterByName("UCTD_Output").value).toBe("CHN/3 Reset [OK]");

        device.getParameterByName("UCTD_Channel").value = 4;
        uctBtnReset(device, online, progress, context);
        expect(device.getParameterByName("UCTD_Output").value).toBe("CHN/4 Reset [OK]");

        device.getParameterByName("UCTD_Channel").value = 1;
        uctBtnReset(device, online, progress, context);
        expect(device.getParameterByName("UCTD_Output").value).toBe("CHN/1 Reset [OK]");

        // TODO extend
    });
});

describe('(Un-)Serialization', () => {
    const uctSerializeParamValue = cts.uctSerializeParamValue;
    const uctUnserializeParamValue = cts.uctUnserializeParamValue;

    describe('Serialize with uctSerializeParamValue(..)', () => {
        test("empty", () => {
            expect(uctSerializeParamValue("")).toBe("");
        });
        
        test("single characters to keep", () => {
            expect(uctSerializeParamValue("0")).toBe("0");
            expect(uctSerializeParamValue("1")).toBe("1");
            expect(uctSerializeParamValue("9")).toBe("9");
            expect(uctSerializeParamValue("a")).toBe("a");
            expect(uctSerializeParamValue("A")).toBe("A");
            expect(uctSerializeParamValue("Z")).toBe("Z");
            expect(uctSerializeParamValue("z")).toBe("z");
            expect(uctSerializeParamValue("-")).toBe("-");
            expect(uctSerializeParamValue("_")).toBe("_");
            expect(uctSerializeParamValue(".")).toBe(".");
        });
    
        test("single characters needs encoding", () => {
            expect(uctSerializeParamValue(" ")).not.toBe(" ");
            expect(uctSerializeParamValue("§")).not.toBe("§");
            expect(uctSerializeParamValue("=")).not.toBe("=");
            expect(uctSerializeParamValue(":")).not.toBe(":");
            expect(uctSerializeParamValue("\t")).not.toBe("\t");
            expect(uctSerializeParamValue("\n")).not.toBe("\n");
            expect(uctSerializeParamValue("/")).not.toBe("/");
            expect(uctSerializeParamValue("\\")).not.toBe("\\");
        });
    
        test("longer unchanged", () => {
            expect(uctSerializeParamValue("abc123def-Y")).toBe("abc123def-Y");
        });
    });

    describe('Unserialize with uctUnserializeParamValue(..)', () => {
        test("empty", () => {
            expect(uctUnserializeParamValue("")).toBe("");
        });

        test("single characters to keep", () => {
            expect(uctUnserializeParamValue("0")).toBe("0");
            expect(uctUnserializeParamValue("5")).toBe("5");
            expect(uctUnserializeParamValue("9")).toBe("9");
            expect(uctUnserializeParamValue("A")).toBe("A");
            expect(uctUnserializeParamValue("x")).toBe("x");
            expect(uctUnserializeParamValue("Z")).toBe("Z");
        });
    });
    
    describe('Serialize and Unserialize', () => {
        test("empty", () => {
            expect(uctUnserializeParamValue(uctSerializeParamValue(""))).toBe("");
        });
        
        test("Several Single Chars", () => {
            expect(uctUnserializeParamValue(uctSerializeParamValue("x"))).toBe("x");
            expect(uctUnserializeParamValue(uctSerializeParamValue(" "))).toBe(" ");
            expect(uctUnserializeParamValue(uctSerializeParamValue("§"))).toBe("§");
            expect(uctUnserializeParamValue(uctSerializeParamValue("="))).toBe("=");
            expect(uctUnserializeParamValue(uctSerializeParamValue("\n"))).toBe("\n");
        });
        
        test("Umlauts", () => {
            expect(uctUnserializeParamValue(uctSerializeParamValue("ä"))).toBe("ä");
            expect(uctUnserializeParamValue(uctSerializeParamValue("ö"))).toBe("ö");
            expect(uctUnserializeParamValue(uctSerializeParamValue("ü"))).toBe("ü");
            expect(uctUnserializeParamValue(uctSerializeParamValue("Ä"))).toBe("Ä");
            expect(uctUnserializeParamValue(uctSerializeParamValue("Ö"))).toBe("Ö");
            expect(uctUnserializeParamValue(uctSerializeParamValue("Ü"))).toBe("Ü");
            expect(uctUnserializeParamValue(uctSerializeParamValue("ß"))).toBe("ß");
        });
        
        test("Complex", () => {
            const complex = 'return module + "/" + channelSource + " -> " + module + "/" + channelTarget + " [OK]";\nNEW-LINE';
            expect(uctUnserializeParamValue(uctSerializeParamValue(complex))).toBe(complex);
        });
        
        test("German Multi-Line", () => {
            const text = "Mährzeilüger\nDeutßer\tText mit SÖnderzeichen%!";
            expect(uctUnserializeParamValue(uctSerializeParamValue(text))).toBe(text);
        });
    });
    
    

});


describe('Helper', () => {
    const uctHexNumberStr = cts.uctHexNumberStr;

    test("uctHexNumberStr(int)", () => {
        expect(uctHexNumberStr(0)).toBe("0x0");
        expect(uctHexNumberStr(5)).toBe("0x5");
        expect(uctHexNumberStr(10)).toBe("0xA");
        expect(uctHexNumberStr(12)).toBe("0xC");
        expect(uctHexNumberStr(15)).toBe("0xF");
        expect(uctHexNumberStr(128)).toBe("0x80");
        expect(uctHexNumberStr(255)).toBe("0xFF");
    });
    
});


describe('Header', () => {

    describe('uctCreateHeader(..)', () => {
        const uctCreateHeader = cts.uctCreateHeader;
        test("create regular header", () => {
            expect(uctCreateHeader("NVEM", 23)).toBe("OpenKNX,cv1,0xAF42:0x23/NVEM:-/23");
            expect(uctCreateHeader("TXS", 0)).toBe("OpenKNX,cv1,0xAF42:0x23/TXS:0x17/0");
            expect(uctCreateHeader("TXS", 6)).toBe("OpenKNX,cv1,0xAF42:0x23/TXS:0x17/6");
            expect(uctCreateHeader("TXS", 78)).toBe("OpenKNX,cv1,0xAF42:0x23/TXS:0x17/78");
        });
    });

    describe('uctParseHeader(headerStr)', () => {
        const uctParseHeader = cts.uctParseHeader;

        test("full regular header", () => {
            const h = uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/17");
            expect(h.prefix).toBe("OpenKNX");
            expect(h.format).toBe("cv1");
            expect(h.generator).toStrictEqual({"name":null, "ver":null});
            expect(h.app).toStrictEqual({"id":0xAF42, "idStr":"0xAF42", "ver":0x23, "verStr":"0x23", "name":null});
            expect(h.modul).toStrictEqual({"key":"XXX", "ver":"0x45"}); // TODO check type for ver string or number?
            // TODO check handling of Channel-Number
            expect(h.channel).toBe("17");

            expect(h).toStrictEqual({
                "prefix": "OpenKNX",
                "format": "cv1",
                "generator": {
                    "name":null, 
                    "ver":null,
                },
                "app": {
                    "id":0xAF42, 
                    "idStr":"0xAF42", 
                    "ver":0x23, 
                    "verStr":"0x23", 
                    "name":null,
                },
                "modul": {
                    "key":"XXX", 
                    "ver":"0x45", // TODO check type for ver string or number?
                },
                "channel": "17", // TODO check
            });

        });

        test("accepted channel definitions", () => {
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/*").channel).toBe("*");
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/0").channel).toBe("0");
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/1").channel).toBe("1");
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/9").channel).toBe("9");
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/10").channel).toBe("10");
            expect(uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/99").channel).toBe("99");
            // TODO check >99 ?
        });

        test("invalid channel definition", () => {
            expect(() => {uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/-17");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/X");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/ABC");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1,0xAF42:0x23/XXX:0x45/+");}).toThrow(Error);
        });

        test("invalid formats", () => {
            expect(() => {uctParseHeader("");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv2,0xAF42:0x23/XXX:0x45/17");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1");}).toThrow(Error);
            expect(() => {uctParseHeader("OpenKNX,cv1,X/X");}).toThrow(Error);
        });

    });
    
});  


describe('Parameter Helper', () => {
    const uctGetModuleParamsDef = cts.uctGetModuleParamsDef;
    const uctGetDeviceParameter = cts.uctGetDeviceParameter;

    describe('uctGetModuleParamsDef(..)', () => {
        test("base configuration", () => {
            expect(uctGetModuleParamsDef("CHN", 0)).toStrictEqual(
                {
                    "names": ["A", "B"],
                    "defaults": [5, 385],
                }                
            );
        });
        test("existing channel", () => {
            expect(uctGetModuleParamsDef("CHN", 5)).toStrictEqual(
                {
                    "names": ["Param~C", "Param~D"],
                    "defaults": [500, "XXXX"],
                }                
            );
        });
        test("non-existing channel", () => {
            expect(() => uctGetModuleParamsDef("CHN", 99)).toThrow(Error);
        });
    });

    describe('uctGetDeviceParameter(..)', () => {
        const device = cts.device;

        test("same id", () => {
            // expect(uctGetDeviceParameter(device, "XXX_Full3Name", 1)).not.toStrictEqual(undefined);
            expect(uctGetDeviceParameter(device, "UCTD_ModuleIndex", 1).value).not.toBe(undefined);
            // TODO extend
        });
        it("supports multi-ref parameters", () => {

            // basic config
            expect(uctGetDeviceParameter(device, "MRP_Single", 1).value).toBe(1000);
            expect(uctGetDeviceParameter(device, "MRP_Multi", 1).value).toBe(1001);
            expect(uctGetDeviceParameter(device, "MRP_Multi", 2).value).toBe(1002);

            // channel
            expect(uctGetDeviceParameter(device, "MRP_c2Single", 1).value).toBe(2000);
            expect(uctGetDeviceParameter(device, "MRP_c2Multi", 1).value).toBe(2001);
            expect(uctGetDeviceParameter(device, "MRP_c2Multi", 2).value).toBe(2002);
        });
    });
    
});  


describe('Param Calculation', () => {
    const uctParamResetResult = cts.uctParamResetResult;
    const uctParamResetSelection = cts.uctParamResetSelection;
    const uctParamResetNothing = cts.uctParamResetNothing;

    test("uctParamResetResult(int)", () => {

        var input;
        var context;
        var output;

        input  = {"field":"value"};
        output = {"result":"x"};
        context  = {};
        uctParamResetResult(input, output, context);
        expect(output.result).toBe("");
        expect(input).toStrictEqual({"field":"value"});
        expect(output).toStrictEqual({"result":""});
        expect(context).toStrictEqual({});


        output = {"result":"x", "other":"yyy"};
        uctParamResetResult(input, output, context);
        expect(output).toStrictEqual({"result":"", "other":"yyy"});

    });

    test("uctParamResetSelection(int)", () => {
        var input;
        var context;
        var output;

        input = {"fff1":"value", "fff2":3};
        output = {"fff3":"x", selection: 15};
        context  = {"ccc1": "z"};
        uctParamResetSelection(input, output, context);
        expect(input).toStrictEqual({"fff1":"value", "fff2":3});
        expect(output).toStrictEqual({"fff3":"x", selection: 255});
        expect(context).toStrictEqual({"ccc1": "z"});
    });

    test("uctParamResetNothing(int)", () => {
        var input;
        var context;
        var output;

        input = {"f1":"value", "f2":3};
        output = {"f3":"x"};
        context  = {"c1": "z"};
        uctParamResetNothing(input, output, context);
        expect(input).toStrictEqual({"f1":"value", "f2":3});
        expect(output).toStrictEqual({"f3":"x"});
        expect(context).toStrictEqual({"c1": "z"});
    });
    
});

