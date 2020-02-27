package utils;

public class ParamsParser {

    private ParamsParser() {}

    public static Params parseParamString(String paramString) {
        return new Params(paramString.split("&")[0], paramString.split("&")[1]);
    }

}
