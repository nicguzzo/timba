import 'brace/mode/java';

export class CustomHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
    constructor() {
        super();
        var keywords = "deposite|depositela|invierta|inviertala|boca|abajo|arriba|en|"+
        "valor|que|menor|o|igual|mayor|tome|una|de|no|esta|vacia|la|carta|palo|palos|"+
        "pila|si|sino|nada|mas|mientras|repita|tiene|cartas|"+
        "un|mazo|ucp|ejecute|con|las|siguientes|definicion|programa|es|a|del";


            var keywordMapper = this.createKeywordMapper({
                "keyword": keywords,
                "constant.language": "bastos|copas|espadas|oros",
            }, "identifier", true);
        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "#.*$"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "constant.numeric", 
                regex : "\\d+?\\b"
            }, {
                token : "keyword.operator",
                regex : ",|\\;|\\:|\\.|\\^"
            }, {
                token : "paren.lparen",
                regex : "[\\(]"
            }, {
                token : "paren.rparen",
                regex : "[\\)]"
            }, {
                token : "variable.language",
                regex : "[a-zA-Z0-9]+?"
            }]
        };
    }
}

export default class TimbaMode extends window.ace.acequire('ace/mode/java').Mode {
    constructor() {
        super();
        this.HighlightRules = CustomHighlightRules;
    }
}