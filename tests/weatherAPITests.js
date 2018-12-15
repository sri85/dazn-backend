const chakram = require('chakram'),
    expect = chakram.expect;
chakram.addMethod('joi', require('chakram-joi'));
const testData = require('./conf.js');
const statusCodes = require('./statusCode');
const joi = require('joi');

describe("Weather API Tests", function () {
    // The default timeout for mocha tests in 2000 ms , but the weather-app-api does not consistently respond within this time
    //which causes the tests to fail inconsistently ,hence the value has been set to a higher value of 10000 ms
    this.timeout(10000);

    it("Check whether latitude and longitude are present in the response ", () => {
        const latLongSchema = joi.object({
            latitude: joi.number().required(),
            longitude: joi.number().required()
        }).required();

        const resp = chakram.post(testData.WEATHER_URL, { address: "E181HL" });
        expect(resp).to.joi(latLongSchema);
        expect(resp).to.have.status(statusCodes.HTTP_OK_CODE);
        return chakram.wait();
    });
    it("Check the status code for the weather API returns 433 when we pass a valid non existent postcode", () => {

        const resp = chakram.post(testData.WEATHER_URL, { address: "B99 9AA" });
        expect(resp).to.have.status(statusCodes.HTTP_VALID_NONEXISTENT_POSTCODE);
        expect(resp).to.comprise.of.json({
            "errorMessage": "Problem with Geocode API: Unable to find that address."
        });
        return chakram.wait();
    });
    it("Check the message when the postcode is invalid", () => {

        const resp = chakram.post(testData.WEATHER_URL, { address: "Invalid" });
        expect(resp).to.have.status(statusCodes.HTTP_INVALID_POSTCODE);
        expect(resp).to.comprise.of.json({
            "errorMessage": "Invalid Address"
        });
        return chakram.wait();
    });

    it("Check the content type validation , should return 435 when the content type is not application/json", () => {
        return chakram.post(testData.WEATHER_URL,
            { "address": "E181HL" }, {
                headers: {
                    'Content-Type': 'application/123'
                },
            })
        .then((response) => {
            return expect(response).to.have.status(statusCodes.HTTP_INVALID_POSTCODE);
        })
    });

    it("Check the status code for the API when the postcode is invalid", () => {

        const resp = chakram.post(testData.WEATHER_URL, { address: "EC1A 1BB" });
        return expect(resp).to.have.status(statusCodes.HTTP_INVALID_POSTCODE);
    });

    it("Check whether time temperature and humidity property is present in the response object", () => {
        const mandatoryObjectSchema = joi.object({
            "currently": {
                time: joi.date().required(),
                temperature: joi.number().required(),
                humidity: joi.number().required()
            }
        }).required();
        const resp = chakram.post(testData.WEATHER_URL, { address: "E181HL" });
        return expect(resp).to.joi(mandatoryObjectSchema);
    });
});
