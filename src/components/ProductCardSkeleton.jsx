function ProductCardSkeleton() {
  return (
    <div className="productCard productCardSkeleton">
      <div className="skeletonImage" />

      <div className="productInfo">
        <div className="skeletonMeta">
          <div className="skeletonBlock" style={{ width: '60px', height: '20px', borderRadius: '999px' }} />
          <div className="skeletonBlock" style={{ width: '40px', height: '16px' }} />
        </div>

        <div className="skeletonBlock" style={{ width: '80px', height: '14px', marginBottom: '6px' }} />
        <div className="skeletonBlock" style={{ width: '100%', height: '22px', marginBottom: '6px' }} />
        <div className="skeletonBlock" style={{ width: '70%', height: '22px', marginBottom: '14px' }} />

        <div className="skeletonBlock" style={{ width: '90px', height: '14px', marginBottom: '6px' }} />
        <div className="skeletonBlock" style={{ width: '120px', height: '34px', marginBottom: '4px' }} />
        <div className="skeletonBlock" style={{ width: '100px', height: '14px', marginBottom: '14px' }} />

        <div className="skeletonBlock" style={{ width: '140px', height: '32px', borderRadius: '999px' }} />

        <div className="skeletonBlock skeletonButton" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
