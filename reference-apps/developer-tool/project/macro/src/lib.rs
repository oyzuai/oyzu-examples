use proc_macro::TokenStream;
#[proc_macro]
pub fn label(_: TokenStream) -> TokenStream { ""Release channel"".parse().unwrap() }
