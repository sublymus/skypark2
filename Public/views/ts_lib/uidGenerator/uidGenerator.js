class UidGenerator {
    generateUid() {
        return Date.now() + "_" + Number(Math.trunc(Math.random() * 9e9 + 1e6)).toString(36);
    }
    validatedUid(uid) {
        return !!uid;
    }
}
export default UidGenerator;
//# sourceMappingURL=uidGenerator.js.map