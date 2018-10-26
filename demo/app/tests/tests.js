var OpentokPlugin = require("nativescript-opentok-plugin").OpentokPlugin;
var opentokPlugin = new OpentokPlugin();

describe("greet function", function() {
    it("exists", function() {
        expect(opentokPlugin.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(opentokPlugin.greet()).toEqual("Hello, NS");
    });
});