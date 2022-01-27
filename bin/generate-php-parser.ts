import type { DeclarationStatement, ExportDeclaration, Expression, Statement, TSEnumMember } from "@typescript-eslint/types/dist/ast-spec";
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

function declarationToPhp(dclr: DeclarationStatement, acc: string = ''): string {
    if (dclr.type === 'TSEnumDeclaration') {
        acc += `enum ${dclr.id.name} {\n`

        dclr.members.forEach((member: TSEnumMember) => {
            acc += `    case ${expressionToPhp(member.id)};\n`
        })

        acc += `}`
    }

    return acc
}

function statementToPhp(stmt: Statement, acc: string = ''): string {
    if (stmt.type === 'ExportNamedDeclaration') {
        acc = declarationToPhp(stmt.declaration as DeclarationStatement, acc)
    }

    return acc
}