{
  // Helper to trim whitespace
  function extractList(head, tail) {
    return [head].concat(tail.map(item => item[3]));
  }
}

Query
  = SelectStmt

SelectStmt
  = _ "SELECT"i _ selectList:SelectList _ 
    "FROM"i _ fromClause:FromClause _ 
    whereClause:WhereClause? _ 
    orderByClause:OrderByClause? _
    limitClause:LimitClause? _ ";"?
    {
      return {
        type: "SelectStmt",
        selectList,
        fromClause,
        whereClause,
        orderByClause,
        limitClause
      };
    }

SelectList
  = head:SelectItem tail:(_ "," _ SelectItem)* {
      return extractList(head, tail);
    }

SelectItem
  = expr:Expression alias:(_ "AS"i _ Identifier)? {
      return alias ? { expr, alias: alias[3] } : expr;
    }

FromClause
  = source:FromSource _ alias:Alias? _ letClause:LetClause? {
      return { source, alias, letClause };
    }

FromSource
  = Subquery
  / UnnestExpr
  / Identifier

UnnestExpr
  = "UNNEST"i _ "(" _ expr:Expression _ ")" {
      return { type: "unnest", expr };
    }

LetClause
  = "LET"i _ bindings:LetBindings {
      return bindings;
    }

LetBindings
  = head:LetBinding tail:(_ "," _ LetBinding)* {
      return extractList(head, tail);
    }

LetBinding
  = name:Identifier _ "=" _ expr:Expression {
      return { name, expr };
    }

Alias
  = "AS"i _ name:Identifier {
      return name;
    }
  / Identifier

WhereClause
  = "WHERE"i _ expr:Expression {
      return expr;
    }

OrderByClause
  = "ORDER"i _ "BY"i _ items:OrderByItems {
      return items;
    }

OrderByItems
  = head:OrderByItem tail:(_ "," _ OrderByItem)* {
      return extractList(head, tail);
    }

OrderByItem
  = expr:Expression _ direction:("ASC"i / "DESC"i)? {
      return { expr, direction: direction || "ASC" };
    }

LimitClause
  = "LIMIT"i _ n:Integer {
      return n;
    }

Expression
  = LogicalOr

LogicalOr
  = left:LogicalAnd _ "OR"i _ right:LogicalOr {
      return { type: "or", left, right };
    }
  / LogicalAnd

LogicalAnd
  = left:LogicalNot _ "AND"i _ right:LogicalAnd {
      return { type: "and", left, right };
    }
  / LogicalNot

LogicalNot
  = "NOT"i _ expr:LogicalNot {
      return { type: "not", expr };
    }
  / Comparison

Comparison
  = left:Primary _ op:("<=" / ">=" / "<" / ">" / "=" / "IN"i) _ right:Primary {
      return { type: "comparison", op: op.toLowerCase(), left, right };
    }
  / ExistsExpr
  / Primary

ExistsExpr
  = "EXISTS"i _ "(" _ subquery:SelectStmt _ ")" {
      return { type: "exists", subquery };
    }

Primary
  = FunctionCall
  / Subquery
  / Parens
  / ArrayLiteral
  / PropertyAccess
  / Integer
  / Literal

FunctionCall
  = name:Identifier _ "(" _ args:FunctionArgs? _ ")" {
      return { type: "function_call", name, args: args || [] };
    }

FunctionArgs
  = head:Expression tail:(_ "," _ Expression)* {
      return extractList(head, tail);
    }

Subquery
  = "(" _ q:SelectStmt _ ")" {
      return q;
    }

Parens
  = "(" _ expr:Expression _ ")" {
      return expr;
    }

ArrayLiteral
  = "[" _ elements:ArrayElements? _ "]" {
      return { type: "array", elements: elements || [] };
    }

ArrayElements
  = head:Expression tail:(_ "," _ Expression)* {
      return extractList(head, tail);
    }

PropertyAccess
  = base:Identifier accessors:PropertyAccessor* {
      return accessors.length > 0 ? 
        { type: "property_access", base, accessors } : 
        base;
    }

PropertyAccessor
  = "." property:Identifier {
      return { type: "property", property };
    }
  / "[" index:Expression "]" {
      return { type: "index", index };
    }
  / "[" "*" "]" {
      return { type: "wildcard" };
    }

Identifier
  = [a-zA-Z_@][a-zA-Z0-9_@/-]* {
      return text();
    }

Integer
  = digits:[0-9]+ {
      return parseInt(digits.join(""), 10);
    }

Literal
  = "'" chars:[^']* "'" {
      return chars.join("");
    }

_
  = [ \t\n\r]*