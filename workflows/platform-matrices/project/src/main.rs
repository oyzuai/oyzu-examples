fn greeting(name: &str) -> String {
    format!("Hello, {name}! Built with Oyzu.")
}

fn main() {
    let name = std::env::args().nth(1).unwrap_or_else(|| "world".into());
    println!("{}", greeting(&name));
}

#[cfg(test)]
mod tests {
    use super::greeting;

    #[test]
    fn names_the_recipient() {
        assert_eq!(greeting("developer"), "Hello, developer! Built with Oyzu.");
    }
}
