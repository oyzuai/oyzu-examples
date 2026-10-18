pub fn channel(value: &str) -> String { value.to_lowercase() }
#[test]
fn normalizes() { assert_eq!(channel("PREVIEW"), "preview"); }
