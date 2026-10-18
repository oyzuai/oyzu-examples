pub fn channel(value: &str) -> String {
    if cfg!(feature = "normalize") {
        value.to_lowercase()
    } else {
        value.to_owned()
    }
}
#[test]
fn normalizes_when_selected() {
    let expected = if cfg!(feature = "normalize") { "preview" } else { "PREVIEW" };
    assert_eq!(channel("PREVIEW"), expected);
}
