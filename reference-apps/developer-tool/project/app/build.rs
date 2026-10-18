use std::{env,fs,path::PathBuf};
fn main() {
 println!("cargo:rerun-if-changed=../channel.txt");
 let channel=fs::read_to_string("../channel.txt").unwrap();
 let generated=format!("pub const CHANNEL: &str = {:?};",channel.trim());
 fs::write(PathBuf::from(env::var_os("OUT_DIR").unwrap()).join("channel.rs"),generated).unwrap();
}
