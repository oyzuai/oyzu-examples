include!(concat!(env!("OUT_DIR"), "/channel.rs"));
fn main() { println!("{}: {}", release_macro::label!(), release_format::channel(CHANNEL)); }
