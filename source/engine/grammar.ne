@{% function buildNode(type, d){return  ({nodeType: type, explanation: d})} %}

main ->
	  	CalcExpression {% id %}
	  |	Variable {% id %}
	  | ModifiedVariable {% id %}
	  | Comparison {% id %}

Comparison -> Comparable _ ComparisonOperator _ Comparable {% d => ({nodeType: 'Comparison', operator: d[2][0], explanation: [d[0], d[4]]}) %}

Comparable -> (int | CalcExpression | Variable) {% d => d[0][0] %}

ComparisonOperator -> ">" | "<" | ">=" | "<=" | "="

ModifiedVariable -> Variable _ Modifier {% d => ({nodeType: 'ModifiedVariable', modifier: d[2], variable: d[0] }) %}

Modifier -> "[" TemporalModifier "]" {% d =>d[1][0] %}

TemporalModifier -> "annuel" | "mensuel" | "jour ouvré" {% id %}

CalcExpression -> Term _ ArithmeticOperator _ Term {% d => ({
	nodeType: 'CalcExpression',
	operator: d[2],
	explanation: [d[0], d[4]],
	type: 'numeric'
}) %}

Term -> Variable {% id %}
	  | int {% id %}

ArithmeticOperator -> "+" {% id %}
	| "-" {% id %}
	| "*" {% id %}
	| "/" {% id %}


# BooleanVariableExpression -> ("!" _):? Variable {% d => (['BooleanVariableExpression', ...d]) %}


Variable -> VariableFragment (_ Dot _ VariableFragment {% d => d[3] %}):*  {% d => ({
	nodeType: 'Variable',
	fragments: [d[0], ...d[1]],
	type: 'numeric | boolean'
}) %}


VariableFragment -> VariableWord (_ VariableWord {% d=> ' ' + d[1] %}):* {% d => d[0] + d[1].join('') %}


VariableWord -> [a-zA-Z\u00C0-\u017F]:+     {% d => d[0].join('') %}

Dot -> [\.] {% d => null %}

_ -> [\s]     {% d => null %}


int -> [0-9]:+        {% d => ({nodeType: 'value', value: d[0].join("")}) %}