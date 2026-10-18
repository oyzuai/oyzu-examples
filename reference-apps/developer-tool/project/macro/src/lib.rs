use proc_macro::TokenStream;
#[proc_macro]
pub fn label(_: TokenStream) -> TokenStream {
    format!("{:?}", "Release channel").parse().unwrap()
}
