{
  function makeLogicalChain(first, rest) {
    return rest.reduce((acc, [op, expr]) => ({
      type: op.toUpperCase(),
      left: acc,
      right: expr
    }), first);
  }
}

Query
  = _ "SELECT"i _ selection:Selection _ "FROM"i _ source:Identifier _ "WHERE"i _ condition:OrExpression _ {
      return { type: "Query", selection, source, condition };
    }

Selection
  = "*" { return { type: "All" }; }

OrExpression
  = left:AndExpression _ rest:(_ "OR"i _ AndExpression)* {
      if (rest.length === 0) return left;
      return makeLogicalChain(left, rest.map(r => ["OR", r[3]]));
    }

AndExpression
  = left:PrimaryExpression _ rest:(_ "AND"i _ PrimaryExpression)* {
      if (rest.length === 0) return left;
      return makeLogicalChain(left, rest.map(r => ["AND", r[3]]));
    }

PrimaryExpression
  = Parens
  / InExpression
  / ComparisonExpression

Parens
  = "(" _ expr:OrExpression _ ")" { return expr; }

InExpression
  = str:StringLiteral _ "IN"i _ identifier:Identifier {
      return { type: "InExpression", value: str, target: identifier };
    }

ComparisonExpression
  = left:Identifier _ op:ComparisonOperator _ right:Integer {
      return { type: "ComparisonExpression", left, operator: op, right };
    }

ComparisonOperator
  = ">" / "<" / ">=" / "<=" / "=" / "!="

Identifier
  = $([a-zA-Z_][a-zA-Z0-9_]*)

StringLiteral
  = "'" chars:Char* "'" { return chars.join(''); }

Char
  = [^']

Integer
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

_ "whitespace"
  = [ \t\n\r]*

