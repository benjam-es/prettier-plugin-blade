import { parse } from "@typescript-eslint/typescript-estree"
import { readFileSync } from "fs";
import path from "path";

const FILES: string[] = [
    __dirname + '/src/lang/token.ts',
];

FILES.forEach(file => {
    const contents = readFileSync(path.resolve(file), "utf-8")
    const tree = parse(contents)

    tree.body.forEach(node => {
        console.log(node)
    })
})