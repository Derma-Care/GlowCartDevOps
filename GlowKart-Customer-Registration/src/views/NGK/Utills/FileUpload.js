export const UploadedPreview = ({ src }) => {
  if (!src) return null

  return (
    <div
      style={{
        marginTop: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'end',
        gap: 10,
      }}
    >
      <img
        src={src}
        alt="Preview"
        style={{
          width: 55,
          height: 55,
          borderRadius: 8,
          objectFit: 'cover',
          border: '2px solid #ff2e85',
        }}
      />
      <span
        style={{
          color: 'green',
          fontSize: 16,
          fontWeight: 'normal',
        }}
      >
        Uploaded
      </span>
    </div>
  )
}
