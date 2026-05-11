import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    old_price: "",
    installment: "",
    stock: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setProducts(data || []);
  }

  async function uploadImage() {
    if (!imageFile) return newProduct.image;

    const fileName = `${Date.now()}-${imageFile.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (error) {
      console.log(error);
      alert("Erro ao enviar imagem");
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function uploadGallery() {
    if (galleryFiles.length === 0) return newProduct.gallery || [];

    const uploadedUrls = [];

    for (const file of galleryFiles) {
      const fileName = `gallery/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) {
        console.log(error);
        alert("Erro ao enviar imagem da galeria");
        return null;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function createProduct(e) {
    e.preventDefault();

    const imageUrl = await uploadImage();

    const galleryUrls = await uploadGallery();

    if (!galleryUrls) return;

    if (!imageUrl) return;

    if (editingProductId) {
      const { error } = await supabase
        .from("products")
        .update({
          ...newProduct,
          image: imageUrl,
          price: parseFloat(newProduct.price) || 0,
          old_price: newProduct.old_price
            ? parseFloat(newProduct.old_price)
            : null,
          stock: parseInt(newProduct.stock) || 0,
          gallery: galleryUrls,
        })
        .eq("id", editingProductId);

      if (error) {
        console.log(error);
        alert("Erro ao atualizar produto");
        return;
      }

      alert("Produto atualizado!");
      setEditingProductId(null);
      loadProducts();
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        ...newProduct,
        image: imageUrl,
        price: parseFloat(newProduct.price) || 0,
        old_price: newProduct.old_price
          ? parseFloat(newProduct.old_price)
          : null,
        stock: parseInt(newProduct.stock) || 0,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Erro ao cadastrar produto");
      return;
    }

    alert("Produto cadastrado com sucesso!");

    setNewProduct({
      name: "",
      brand: "",
      category: "",
      description: "",
      price: "",
      old_price: "",
      installment: "",
      stock: "",
      image: "",
      gallery: galleryUrls,
    });

    loadProducts();
  }

  async function deleteProduct(productId) {
    const confirmDelete = confirm("Deseja excluir este produto?");

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.log(error);
      alert("Erro ao excluir produto");
      return;
    }

    alert("Produto excluído!");

    loadProducts();
  }

  function startEdit(product) {
    setEditingProductId(product.id);

    setNewProduct({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price || "",
      old_price: product.old_price || "",
      installment: product.installment || "",
      stock: product.stock || "",
      image: product.image || "",
    });
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="adminDashboard">
      <div className="adminHeader">
        <h1>Dashboard Admin</h1>

        <button onClick={handleLogout}>Sair</button>
      </div>
      <form
        className="adminForm"
        onSubmit={createProduct}
        style={{ display: "grid", gap: 12, marginBottom: 30 }}
      >
        <h2>Cadastrar produto</h2>

        <input
          placeholder="Nome"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <input
          placeholder="Marca"
          value={newProduct.brand}
          onChange={(e) =>
            setNewProduct({ ...newProduct, brand: e.target.value })
          }
        />
        <input
          placeholder="Categoria"
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        />
        <input
          placeholder="Descrição"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <input
          placeholder="Preço"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <input
          placeholder="Preço antigo"
          value={newProduct.old_price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, old_price: e.target.value })
          }
        />
        <input
          placeholder="Parcelamento"
          value={newProduct.installment}
          onChange={(e) =>
            setNewProduct({ ...newProduct, installment: e.target.value })
          }
        />
        <input
          placeholder="Estoque"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
        />
        {imageFile && (
          <div className="adminPreviewWrapper">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
              className="adminPreviewImage"
            />
          </div>
        )}

        {galleryFiles.length > 0 && (
          <div className="adminGalleryPreview">
            {galleryFiles.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview galeria ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="adminFormActions">
          <button type="submit">
            {editingProductId ? "Salvar alterações" : "Cadastrar produto"}
          </button>

          {editingProductId && (
            <button
              type="button"
              className="cancelEditButton"
              onClick={() => {
                setEditingProductId(null);

                setNewProduct({
                  name: "",
                  brand: "",
                  category: "",
                  description: "",
                  price: "",
                  old_price: "",
                  installment: "",
                  stock: "",
                  image: "",
                });
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <table className="adminTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>

              <td>
                <img src={product.image} alt={product.name} width="60" />
              </td>

              <td>{product.name}</td>

              <td>R$ {Number(product.price).toFixed(2)}</td>

              <td>{product.category}</td>

              <td>
                <div className="adminActions">
                  <button
                    className="deleteButton"
                    onClick={() => deleteProduct(product.id)}
                  >
                    🗑 Excluir
                  </button>

                  <button
                    className="editButton"
                    onClick={() => startEdit(product)}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
