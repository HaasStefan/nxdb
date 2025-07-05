Start
  = _ query:Query _ { return query; }

Query
  = "SELECT"i _ selection:Selection _ "FROM"i _ source:Identifier _ "WHERE"i _ condition:OrExpression {
      return { type: "Query", selection, source, condition };
    }

Selection
  = _ "*" _ { return { type: "All" }; }

Identifier
  = $([a-zA-Z_][a-zA-Z0-9_]*)

OrExpression
  = left:AndExpression _ rest:(_ "OR"i _ AndExpression)* {
      if (rest.length === 0) return left;
      return rest.reduce((acc, r) => ({ type: "OR", left: acc, right: r[3] }), left);
    }

AndExpression
  = left:PrimaryExpression _ rest:(_ "AND"i _ PrimaryExpression)* {
      if (rest.length === 0) return left;
      return rest.reduce((acc, r) => ({ type: "AND", left: acc, right: r[3] }), left);
    }

PrimaryExpression
  = "(" _ expr:OrExpression _ ")" { return expr; }
  / StringInExpression
  / ComparisonExpression

StringInExpression
  = str:StringLiteral _ "IN"i _ id:Identifier {
      return { type: "InExpression", value: str, target: id };
    }

ComparisonExpression
  = left:Identifier _ op:ComparisonOperator _ right:(Integer / StringLiteral) {
      return { type: "ComparisonExpression", left, operator: op, right };
    }

ComparisonOperator
  = ">" / "<" / ">=" / "<=" / "=" / "!="

StringLiteral
  = "'" chars:([^']*) "'" { return chars.join(''); }

Integer
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

_ "whitespace"
  = [ \t\r\n]*
