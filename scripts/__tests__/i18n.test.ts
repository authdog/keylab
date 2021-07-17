import { generateFrontMatter } from "../build-i18n-tools";

it("generate correctly frontmatter config", () => {
    const expectedWithEmptyObject = "---\n---";
    const testObj0 = {};
    expect(generateFrontMatter(testObj0)).toEqual(expectedWithEmptyObject);

    const expectedWithFooFieldObject = "---\nfoo: bar\n---";
    const testObj1 = { foo: "bar" };
    expect(generateFrontMatter(testObj1)).toEqual(expectedWithFooFieldObject);

    const expectedWithDocusaurusConfigFm =
        "---\nhide_title: true\nsidebar_label: Some text\n---";
    const testObj2 = { hide_title: true, sidebar_label: "Some text" };
    expect(generateFrontMatter(testObj2)).toEqual(
        expectedWithDocusaurusConfigFm
    );
});
