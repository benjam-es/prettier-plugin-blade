import type { ClassElement, DeclarationStatement, MethodDefinition, Expression, Statement, TSEnumMember, Parameter, TSTypeAnnotation, TypeNode } from "@typescript-eslint/types/dist/ast-spec";
import { parse } from "@typescript-eslint/typescript-estree"
import { readFileSync } from "fs";
import path from "path";

const FILES: string[] = [
    __dirname + '/src/lang/token.ts',
];

FILES.forEach(file => {
    const contents = readFileSync(path.resolve(file), "utf-8")
    const tree = parse(contents)

    let php = ''
    tree.body.forEach(node => {
        php = statementToPhp(node, php)
    })
    console.log(php)
})

function expressionToPhp(expr: Expression, acc: string = ''): string {
    if (expr.type === 'Identifier') {
        acc += expr.name
    }

    return acc
}

function typeToPhp(t: TSTypeAnnotation): string {
    switch (t.typeAnnotation.type) {
        case 'TSStringKeyword':
            return 'string'
        case 'TSNumberKeyword':
            return 'int'
        case 'TSTypeReference':
            return expressionToPhp(t.typeAnnotation.typeName as Expression)
    }

    return ''
}

function methodToPhp(method: MethodDefinition): string {
    let acc = `${method.accessibility ?? 'public'} function ${method.kind === "constructor" ? "__construct" : expressionToPhp(method.key as Expression)}(\n`

    method.value.params.forEach((parameter: Parameter) => {
        if (parameter.type === 'TSParameterProperty') {
            // @ts-ignore
            acc += `    ${parameter.accessibility} ${typeToPhp(parameter.parameter.typeAnnotation)} $${parameter.parameter.name},\n`
        } else {
            throw "TODO"
        }
    })

    acc += ') {\n'
    acc += "\n}\n"

    return acc
}

function declarationToPhp(dclr: DeclarationStatement, acc: string = ''): string {
    if (dclr.type === 'TSEnumDeclaration') {
        acc += `\nenum ${dclr.id.name} {\n`

        dclr.members.forEach((member: TSEnumMember) => {
            acc += `    case ${expressionToPhp(member.id)};\n`
        })

        acc += `}\n`
    } else if (dclr.type === 'ClassDeclaration') {
        acc += `\nclass ${dclr.id?.name} {\n`

        dclr.body.body.forEach((element: ClassElement) => {
            if (element.type === 'MethodDefinition') {
                acc += methodToPhp(element)
            }
        })

        acc += "}\n"
    }

    return acc
}

function statementToPhp(stmt: Statement, acc: string = ''): string {
    if (stmt.type === 'ExportNamedDeclaration') {
        acc = declarationToPhp(stmt.declaration as DeclarationStatement, acc)
    }

    return acc
}